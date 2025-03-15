import express from 'express'
import bcrypt from 'bcryptjs'
import User from '../schemas/User.js'
import Deal from '../schemas/Deal.js'
import Label from '../schemas/Label.js'
import Post from '../schemas/Post.js'
import { configDotenv } from 'dotenv'; configDotenv()

import { isValidObjectId, Types } from 'mongoose'

const router = express.Router()

router.post('/createUser', async (req, res) => {
    try {
        if (req.user.role != 'admin') return res.sendStatus(401)

        if (!req.body.name.first && !req.body.name.last) return res.status(400).send("Missing First and Last Name")

        if (!req.body.name.first) return res.status(400).send("Missing First Name")

        if (!req.body.name.last) return res.status(400).send("Missing Last Name")

        if (!req.body.password) return res.status(400).send("Missing Password")

        const existingUser = await User.findOne({ 'name.first': req.body.name.first, 'name.last': req.body.name.last })

        if (existingUser) return res.status(409).send("User With Same Name Exists")

        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        req.body.password = hashedPassword

        await new User(req.body).save()

        res.sendStatus(201)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/allUsers', async (req, res) => {
    try {
        if (req.user.role != 'admin') return res.sendStatus(401)

        const users = await User.find({}, { projection: { password: 0 } }).toArray()

        res.status(200).json(users)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/user', async (req, res) => {
    try {
        const user = await User.findById(req.user._id, { password: 0 })

        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/cityOptions', async (req, res) => {
    try {
        const cities = await Deal.distinct('address.city', req.query.states || req.query.states === '' ? { 'address.state': { $in: req.query.states.split(',') } } : {}).then(results => results.filter(result => result != null))

        res.status(200).json(cities)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/queryOptions', async (req, res) => {
    try {
        const [labels, states, cities] = await Promise.all([
            Label.distinct('label').then(results => ['Unchecked', ...results]),
            Deal.distinct('address.state').then(results => results.filter(result => result != null)),
            Deal.distinct('address.city', req.query.blacklistedStates ? { 'address.state': { $nin: req.query.blacklistedStates.split(',') } } : {}).then(results => results.filter(result => result != null)),
            Deal.aggregate([
                {
                    $lookup: {
                        from: 'posts',
                        localField: 'associatedPost',
                        foreignField: '_id',
                        as: 'post'
                    }
                },
                {
                    $unwind: '$post'
                },
                {
                    $group: {
                        _id: '$post.author'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        author: '$_id'
                    }
                }
            ]).then(docs => docs.map(doc => doc.author))
        ])

        const options = {
            labels,
            states,
            cities
        }

        res.status(200).json(options)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/deals', async (req, res) => {
    try {
        if (!req.body.limit) return res.status(400).json({ error: "Missing 'limit' parameter." })

        // if (req.body.limit > 50) return res.status(400).json({ error: 'Limit must be less than 50.' })

        if (!req.body['sort']) return res.status(400).json({ error: "Missing 'sort' parameter." })

        const pipe = createAggregationPipeFromQuery(req)

        // console.dir(pipe, { depth: 10 })

        delete req.body.next
        delete req.body.text

        const [deals] = await Promise.all([
            Deal.aggregate(pipe),
            User.updateOne({ _id: req.user._id }, { $set: { dealsQuery: req.body } })
        ])

        const next = (() => {
            if (deals.length !== parseInt(req.body['limit']) + 1) return null

            deals.pop()

            const lastDeal = deals.at(-1)

            const lastDealSortValue = (() => {
                switch (req.body['sort'].toLowerCase()) {
                    case 'date': return lastDeal?.post?.createdAt
                    case 'asking': return lastDeal?.price
                    case 'arv': return lastDeal?.arv
                    case 'price/arv': return lastDeal?.priceToARV
                }
            })()

            return `${lastDealSortValue}_${lastDeal._id}`
        })()

        res.status(200).json({deals, next})
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/deal', async (req, res) => {
    try {
        if (!isValidObjectId(req.query.id)) return res.status(400).send('Invalid Deal ID')

        const deal = await Deal.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(req.query.id)
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'associatedPost',
                    foreignField: '_id',
                    as: 'post'
                }
            },
            {
                $unwind: '$post'
            },
            {
                $lookup: {
                    from: "labels", // Name of the UserDealLabel collection
                    let: { dealId: "$_id" },
                    pipeline: [
                        { 
                            $match: {
                                $expr: { 
                                    $and: [
                                        { $eq: ["$deal", "$$dealId"] },
                                        { $eq: ["$user", new Types.ObjectId(req.user._id)] } // Filter by user
                                    ]
                                }
                            }
                        }
                    ],
                    as: "userLabel"
                }
            },
            {
                $addFields: {
                    label: { $ifNull: [{ $arrayElemAt: ["$userLabel.label", 0] }, "Unchecked"] } // Default to "Unchecked"
                }
            },
            {
                $addFields: {
                    hasIssueRaised: {
                        $in: [req.user._id, { 
                            $map: {
                                input: { $ifNull: [{ $objectToArray: "$raisedIssues" }, []] },
                                as: "issue",
                                in: "$$issue.k" 
                            } 
                        }]
                    }
                }
            },
            {
                $project: {
                    raisedIssues: 0,
                    userLabel: 0,
                    associatedPost: 0,
                    __v: 0,
                    'post.__v': 0,
                    'post.associatedDeal': 0
                }
            }
        ]).then(docs => docs[0])

        if (!deal) return res.status(400).send('Deal not found')

        res.status(200).json(deal)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/changeLabel', async (req, res) => {
    try {
        if (req.body.label === "Unchecked") {
            await Label.findOneAndDelete({ user: req.user._id, deal: req.body.id })
        } else {
            await Label.findOneAndUpdate(
                { user: req.user._id, deal: req.body.id },
                {
                    $set: { label: req.body.label }, // Always update the label
                    $setOnInsert: { user: req.user._id, deal: req.id } // Only set these on insert
                },
                { upsert: true, new: true } // Creates if not exists
            )
        }

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/dealCounts', async (req, res) => {
    try {
        console.log('ayo')
        const pipe = createAggregationPipeFromQuery(req).slice(0, 6)

        pipe.push({ $count: 'totalCount' })

        const [queryCount, totalCount] = await Promise.all([
            Deal.aggregate(pipe).then(docs => docs.length ? docs[0].totalCount : 0),
            Deal.countDocuments({})
        ])
        console.log('ayo2')

        res.json({ queryCount, totalCount })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/dealIssue', async (req, res) => {
    try {
        await Deal.updateOne( { _id: req.body.id }, { 
            $addToSet: { 
                [`raisedIssues.${req.user._id}`]: { $each: req.body.selectedIssues } 
            } 
        })

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

export default router





function createAggregationPipeFromQuery(req) {
    return [
        {
            $lookup: {
                from: 'posts',
                localField: 'associatedPost',
                foreignField: '_id',
                as: 'post'
            }
        },
        {
            $unwind: '$post'
        },
        {
            $addFields: {
                priceToARV: {
                    $cond: {
                        if: { $and: [{ $ne: ["$price", null] }, { $ne: ["$arv", null] }] },
                        then: { $divide: ["$price", "$arv"] },
                        else: null
                    }
                }
            }
        },
        {
            $lookup: {
                from: "labels", // Name of the UserDealLabel collection
                let: { dealId: "$_id" },
                pipeline: [
                    { 
                        $match: {
                            $expr: { 
                                $and: [
                                    { $eq: ["$deal", "$$dealId"] },
                                    { $eq: ["$user", new Types.ObjectId(req.user._id)] } // Filter by user
                                ]
                            }
                        }
                    }
                ],
                as: "userLabel"
            }
        },
        {
            $addFields: {
                label: { $ifNull: [{ $arrayElemAt: ["$userLabel.label", 0] }, "Unchecked"] } // Default to "Unchecked"
            }
        },
        {
            $match: {
                ...(req.body['sort'] !== 'Date' && { [req.body['sort'] === 'Asking' ? 'price' : req.body['sort'] === 'ARV' ? 'arv' : 'priceToARV']: { $ne: null } }),
                ...(req.body['blacklistedLabels'].length && { 'label': { $nin: req.body['blacklistedLabels'] } }),
                ...(req.body['blacklistedStates'].length && { 'address.state': { $nin: req.body['blacklistedStates'] } }),
                ...(req.body['blacklistedCities'].length && { 'address.city': { $nin: req.body['blacklistedCities'] } }),
                ...(req.body['blacklistedAuthors'].length && { 'post.author.id': { $nin: req.body['blacklistedAuthors'].map(author => author.id) } }),
                ...(req.body['daysOld'] && { 'post.createdAt': { $gte: new Date(new Date().setDate(new Date().getDate() - req.body['daysOld'])) } }),
                ...((req.body['text'] || req.body['dealTypes']) && {
                    $and: [
                        ...(req.body['dealTypes'] ? [{
                            $or: req.body['dealTypes'].length ? req.body['dealTypes'].map(dealType => ({
                                category: dealType,
                                ...(req.body[dealType === 'SFH Deal' ? 'neededSFHInfo' : 'neededLandInfo'].length && {
                                    $and: (() => {
                                        if (dealType === 'SFH Deal') {
                                            return req.body['neededSFHInfo'].map(info => {
                                                switch (info) {
                                                    case 'street': return { 'address.streetName': { $ne: null } }
                                                    case 'city': return { 'address.city': { $ne: null } }
                                                    case 'state': return { 'address.state': { $ne: null } }
                                                    case 'zip': return { 'address.zip': { $ne: null } }
                                                    case 'price': return { 'price': { $ne: null } }
                                                    case 'arv': return { 'arv': { $ne: null } }
                                                }
                                            })
                                        } else if (dealType === 'Land Deal') {
                                            return req.body['neededLandInfo'].map(info => {
                                                switch (info) {
                                                    case 'street': return { 'address.streetName': { $ne: null } }
                                                    case 'city': return { 'address.city': { $ne: null } }
                                                    case 'state': return { 'address.state': { $ne: null } }
                                                    case 'zip': return { 'address.zip': { $ne: null } }
                                                    case 'price': return { 'price': { $ne: null } }
                                                }
                                            })
                                        }
                                    })()
                                })
                            })) : [ { category: { $in: req.body['dealTypes'] } } ]
                        }] : []),

                        ...(req.body['text'] ? [{
                            $or: [
                                { 'post.author.name': { $regex: req.body['text'], $options: "i" } },
                                { 'address.streetName': { $regex: req.body['text'], $options: "i" } },
                                { 'address.streetNumber': { $regex: req.body['text'], $options: "i" } },
                                { 'address.city': { $regex: req.body['text'], $options: "i" } },
                                { 'address.state': { $regex: req.body['text'], $options: "i" } },
                                { 'address.zip': { $regex: req.body['text'], $options: "i" } },
                            ]
                        }] : [])
                    ]
                }),

                ...(req.body['next'] && { $or: (() => {
                    const sortingDirection = req.body.order?.toLocaleLowerCase() === 'descending' ? '$lt' : '$gt'

                    const sortingField = (() => {
                        switch (req.body['sort'].toLowerCase()) {
                            case 'date': return 'post.createdAt'
                            case 'asking': return 'price'
                            case 'arv': return 'arv'
                            case 'price/arv': return 'priceToARV'
                        }
                    })()

                    let [nextSortedValue, nextID] = req.body['next'].split('_')

                    if (req.body['sort'].toLowerCase() === 'date') nextSortedValue = new Date(nextSortedValue)
                    if (req.body['sort'].toLowerCase() === 'asking') nextSortedValue = parseInt(nextSortedValue)
                    if (req.body['sort'].toLowerCase() === 'arv') nextSortedValue = parseInt(nextSortedValue)
                    if (req.body['sort'].toLowerCase() === 'price/arv') nextSortedValue = parseFloat(nextSortedValue)

                    return [
                        { [sortingField]: { [sortingDirection]: nextSortedValue } },
                        {
                            [sortingField]: { [sortingDirection]: nextSortedValue },
                            _id: { [sortingDirection]: new Types.ObjectId(nextID) }
                        }
                    ]
                })() })
            }
        },
        {
            $sort: (() => {
                const sortOrder = req.body.order?.toLocaleLowerCase() === 'descending' ? -1 : 1

                switch (req.body['sort'].toLowerCase()) {
                    case 'date': return { 'post.createdAt': sortOrder, _id: sortOrder }
                    case 'asking': return { 'price': sortOrder, _id: sortOrder }
                    case 'arv': return { 'arv': sortOrder, _id: sortOrder }
                    case 'price/arv': return { 'priceToARV': sortOrder, _id: sortOrder }
                }
            })()
        },
        {
            $limit: parseInt(req.body['limit']) + 1
        },
        {
            $project: {
                userLabel: 0,
                __v: 0,
                'post.__v': 0,
                'post._id': 0,
                'post.attachedPost': 0,
                'post.comments': 0,
                'post.group': 0,
                'post.id': 0,
                'post.images': 0,
                'post.metadata': 0,
                'post.text': 0,
                'post.author.id': 0
            }
        }
    ]
}
