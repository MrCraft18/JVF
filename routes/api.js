import express from 'express'
import bcrypt from 'bcryptjs'
import Deal from '../schemas/deal.js'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()

const databaseClient = new MongoClient(process.env.MONGODB_URI)
const usersCollection = databaseClient.db('JVF').collection('users')

const router = express.Router()

router.post('/createUser', async (req, res) => {
    try {
        if (req.user.role != 'admin') return res.sendStatus(401)

        if (!req.body.name.first && !req.body.name.last) return res.status(400).send("Missing First and Last Name")

        if (!req.body.name.first) return res.status(400).send("Missing First Name")

        if (!req.body.name.last) return res.status(400).send("Missing Last Name")

        if (!req.body.password) return res.status(400).send("Missing Password")

        const existingUser = await usersCollection.findOne({ 'name.first': req.body.name.first, 'name.last': req.body.name.last })

        if (existingUser) return res.status(409).send("User With Same Name Exists")

        const hashedPassword = await bcrypt.hash(req.body.password, 10)

        req.body.password = hashedPassword

        await usersCollection.insertOne(req.body)

        res.sendStatus(201)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/allUsers', async (req, res) => {
    try {
        const users = await usersCollection.find({}, { projection: { password: 0 } }).toArray()

        res.status(200).json(users)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/user', async (req, res) => {
    try {
        const user = await usersCollection.findOne({ _id: new ObjectId(req.query.id) }, { projection: { password: 0 } })

        res.status(200).json(user)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/cityOptions', async (req, res) => {
    try {
        const cities = await Deal.distinct('address.city', req.query.states ? { 'address.state': { $in: req.query.states.split(',') } } : {}).then(results => results.filter(result => result != null))

        res.status(200).json(cities)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/queryOptions', async (req, res) => {
    try {
        const options = {
            labels: await Deal.distinct('label').then(results => results.filter(result => result != null)),
            states: await Deal.distinct('address.state').then(results => results.filter(result => result != null)),
            cities: await Deal.distinct('address.city', req.query.blacklistedStates ? { 'address.state': { $nin: req.query.blacklistedStates.split(',') } } : {}).then(results => results.filter(result => result != null)),
            authors: await Deal.aggregate([
                {
                    $lookup: {
                        from: 'posts',
                        localField: 'associatedPost',
                        foreignField: '_id',
                        as: 'postDetails'
                    }
                },
                {
                    $unwind: '$postDetails'
                },
                {
                    $group: {
                        _id: '$postDetails.author'
                    }
                },
                {
                    $project: {
                        _id: 0,
                        author: '$_id'
                    }
                }
            ]).then(docs => docs.map(doc => doc.author))
        }

        res.status(200).json(options)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/deals', async (req, res) => {
    try {
        // console.log(req.body)

        if (!req.body.limit) return res.status(400).json({ error: "Missing 'limit' parameter." })

        if (req.body.limit > 50) return res.status(400).json({ error: 'Limit must be less than 50.' })

        const pipe = [
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
                $match: {
                    ...(req.body['blacklistedLabels'].length && { 'label': { $nin: req.body['blacklistedLabels'] } }),
                    ...(req.body['blacklistedStates'].length && { 'address.state': { $nin: req.body['blacklistedStates'] } }),
                    ...(req.body['blacklistedCities'].length && { 'address.city': { $nin: req.body['blacklistedCities'] } }),
                    ...(req.body['blacklistedAuthors'].length && { 'post.author.id': { $nin: req.body['blacklistedAuthors'] } }),
                    ...(req.body['daysOld'] && { 'post.createdAt': { $gte: new Date(new Date().setDate(new Date().getDate() - req.body['daysOld'])) } }),
                    ...((req.body['text'] || req.body['dealTypes']) && {
                        $and: [
                            ...(req.body['dealTypes'] ? [{
                                $or: req.body['dealTypes'].map(dealType => ({
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
                                }))
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
                }
            },
            {
                $sort: (() => {
                    switch (req.body['sort']?.toLowerCase()) {
                        case 'date':
                            return { 'post.createdAt': req.body.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }

                        case 'asking':
                            return { 'price': req.body.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }

                        case 'arv':
                            return { 'arv': req.body.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }

                        case 'price/arv':
                            return { 'priceToARV': req.body.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }
                    }
                })()
            },
            {
                $limit: parseInt(req.body['limit'])
            },
            {
                $project: {
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

        // console.dir(pipe, { depth: 10 })

        const deals = await Deal.aggregate(pipe)

        await usersCollection.updateOne({ _id: new ObjectId(req.user._id) }, { $set: { dealsQuery: req.body } })

        res.status(200).json(deals)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/deal', async (req, res) => {
    try {
        const deal = await Deal.aggregate([
            {
                $match: {
                    _id: new ObjectId(req.query.id)
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
                $project: {
                    associatedPost: 0,
                    __v: 0,
                    'post.__v': 0,
                    'post.associatedDeal': 0
                }
            }
        ]).then(docs => docs[0])

        res.status(200).json(deal)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/changeLabel', async (req, res) => {
    try {
        await Deal.updateOne({ _id: new ObjectId(req.body.id) }, { $set: { label: req.body.label } })

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

export default router