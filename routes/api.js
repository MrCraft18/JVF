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

        const existingUser = await usersCollection.findOne({'name.first': req.body.name.first, 'name.last': req.body.name.last})

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
        const cities = await Deal.distinct('address.city', req.query.states ?  { 'address.state': { $in: req.query.states.split(',') } } : {}).then(results => results.filter(result => result != null))

        res.status(200).json(cities)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/stateOptions', async (req, res) => {
    try {
        const states = await Deal.distinct('address.state').then(results => results.filter(result => result != null))

        res.status(200).json(states)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/authorOptions', async (req ,res) => {
    try {
        const authors = await Deal.aggregate([
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

        res.status(200).json(authors)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/labelOptions', async (req, res) => {
    try {
        const labels = await Deal.distinct('label').then(results => results.filter(result => result != null))

        res.status(200).json(labels)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.get('/deals', async (req, res) => {
    try {
        if (!req.query.limit) return res.status(400).json({ error: "Missing 'limit' parameter." })

        if (req.query.limit > 50) return res.status(400).json({ error: 'Limit must be less than 50.' })

        // console.log(req.query)

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
                    ...(req.query['labels'] && { 'label': { $in: req.query['labels'] != '' ? req.query['labels'].split(',') : [] } }),
                    ...(req.query['states'] && { 'address.state': { $in: req.query['states'] != '' ? req.query['states'].split(',') : [] } }),
                    ...(req.query['cities'] && { 'address.city': { $in: req.query['cities'] != '' ? req.query['cities'].split(',') : [] } }),
                    ...(req.query['blacklistedAuthors'] && { 'post.author.id': { $nin: req.query['blacklistedAuthors'].split(',') } }),
                    ...(req.query['daysOld'] && { 'post.createdAt': { $gte: new Date(new Date().setDate(new Date().getDate() - req.query['daysOld'])) } }),
                    ...(req.query['dealTypes'] && { $or: req.query['dealTypes'] != '' ? req.query['dealTypes'].split(',').map(dealType => ({
                        category: dealType,
                        ...(req.query[dealType === 'SFH Deal' ? 'neededSFHInfo' : 'neededLandInfo'].split(',').filter(info => info != '').length > 0 && { $and: (() => {
                            if (dealType === 'SFH Deal') {
                                return req.query['neededSFHInfo'].split(',').map(info => {
                                    switch (info) {
                                        case 'street':
                                            return { 'address.streetName': { $ne: null } }
                                        case 'city':
                                            return { 'address.city': { $ne: null } }
                                        case 'state':
                                            return { 'address.state': { $ne: null } }
                                        case 'zip':
                                            return { 'address.zip': { $ne: null } }
                                        case 'price':
                                            return { 'price': { $ne: null } }
                                        case 'arv':
                                            return { 'arv': { $ne: null } }
                                    }
                                })
                            } else if (dealType === 'Land Deal') {
                                return req.query['neededLandInfo'].split(',').map(info => {
                                    switch (info) {
                                        case 'street':
                                            return { 'address.streetName': { $ne: null } }
                                        case 'city':
                                            return { 'address.city': { $ne: null } }
                                        case 'state':
                                            return { 'address.state': { $ne: null } }
                                        case 'zip':
                                            return { 'address.zip': { $ne: null } }
                                        case 'price':
                                            return { 'price': { $ne: null } }
                                    }
                                })
                            }
                        })() })
                    })) : [] })
                }
            },
            {
                $sort: (() => {
                    switch (req.query['sort']?.toLowerCase()) {
                        case 'date':
                            return { 'post.createdAt': req.query.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }

                        case 'asking':
                            return { 'price': req.query.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }

                        case 'arv':
                            return { 'arv': req.query.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }

                        case 'price/arv':
                            return { 'priceToARV': req.query.order?.toLocaleLowerCase() === 'descending' ? -1 : 1 }
                    }
                })()
            },
            {
                $limit: parseInt(req.query['limit'])
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

        // console.dir(pipe, {depth: 10})

        const deals = await Deal.aggregate(pipe)

        await usersCollection.updateOne({ _id: new ObjectId(req.user._id) }, { $set: { dealsQuery: req.query } })

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