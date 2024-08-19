import OpenAI from 'openai'
import fs from 'fs'
import * as fuzz from 'fuzzball'
import predictCategories from '../functons/predictCategories.js'
import axios from 'axios'
import Email from './email.js'
import Deal from './deal.js'
import mongoose from 'mongoose'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()



const databaseClient = new MongoClient(process.env.MONGODB_URI)
const groupsCollection = databaseClient.db('JVF').collection('groups')

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})



const postSchema = new mongoose.Schema({
    text: String,
    translaion: String,
    comments: {
        type: [Object],
        default: undefined
    },
    createdAt: Date,
    images: {
        type: [String],
        default: undefined
    },
    id: String,
    group: {
        name: String,
        id: String
    },
    author: {
        name: String,
        id: String
    },
    attachedPost: {
        text: String,
        images: {
            type: [String],
            default: undefined
        },
        timestamp: Date,
        translaion: String,
        author: {
            name: String,
            id: String
        }
    },
    metadata: {
        includesMultipleDeals: Boolean,
        associatedDeal: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Deal'
        },
        duplicateOf: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Post'
        },
        foundAt: {
            type: Date,
            default: new Date()
        },
        checkedForEmails: {
            type: Boolean,
            default: false
        },
        eligibleForTraining: {
            type: Boolean,
            default: false
        }
    }
})

postSchema.methods.allText = function() {
    return `${this.text || ''}${this.attachedPost?.text ? `\n${this.attachedPost.text}` : ''}`
}

postSchema.methods.checkIfDupilcate = async function () {
    const Post = this.model('Post')

    const postsCursor = Post.find({ 'metadata.duplicateOf': { $exists: false } }, { text: 1, 'attachedPost.text': 1, 'metadata.duplicatePosts': 1 }).sort({ _id: -1 }).cursor()

    // return new Promise((resolve, reject) => {
    //     let cursorClosed = false

    //     postsCursor.on('data', async postDoc => {
    //         if (cursorClosed) return

    //         const post = new Post(postDoc)

    //         if (fuzz.ratio(this.allText(), post.allText()) > 90) {
    //             cursorClosed = true
    //             postsCursor.close()

    //             this.metadata.duplicateOf = post._id

    //             resolve(true)

    //             if (post.metadata.duplicatePosts) {
    //                 post.metadata.duplicatePosts.push(this._id)
    //             } else {
    //                 post.metadata.duplicatePosts = [this._id]
    //             }

    //             await post.save()
    //         }
    //     })

    //     postsCursor.on('end', () => {
    //         if (!cursorClosed) {
    //             resolve(false)
    //         }
    //     })
    // })

    for await (const postDoc of postsCursor) {
        const post = new Post(postDoc)
        const similarity = fuzz.ratio(this.allText(), post.allText())

        if (similarity > 90) {
            if (post.metadata.duplicatePosts) {
                post.metadata.duplicatePosts.push(this._id)
            } else {
                post.metadata.duplicatePosts = [this._id]
            }

            await post.save()

            this.metadata.duplicateOf = post._id

            return true
        }
    }
    return false
}

postSchema.methods.getDeal = async function() {
    //Get Predicted Category
    const predictionResult = await predictCategories([this.allText()]).then(results => results[0])

    // this.metadata.predictedCategoryProbabilities = predictionResult.probabilities

    if (predictionResult.category === 'None') return

    //If Category is Deal then check with GPT if post includes multiple Deals
    const includesMultipleDeals = await promptGPT(fs.readFileSync('./gpt-prompts/includesMultipleDeals.txt', 'utf-8'), this.allText()).then(response => response.result)

    //If it does include multiple Deals then mark it as such and return.
    if (includesMultipleDeals) return this.metadata.includesMultipleDeals = true

    //Extract info with GPT
    const extractedInfo = await promptGPT(fs.readFileSync('./gpt-prompts/extractData.txt', 'utf-8'), this.allText())

    // //Street Number
    // this.metadata.extractedInfo.streetNumber = await promptGPT(fs.readFileSync('./gpt-prompts/extractStreetNumber.txt', 'utf-8'), this.allText()).then(response => response.result)

    // //Street Name
    // this.metadata.extractedInfo.streetName = await promptGPT(fs.readFileSync('./gpt-prompts/extractStreetName.txt', 'utf-8'), this.allText()).then(response => response.result)

    // //City
    // this.metadata.extractedInfo.city = await promptGPT(fs.readFileSync('./gpt-prompts/extractCity.txt', 'utf-8'), this.allText()).then(response => response.result)

    // //State
    // this.metadata.extractedInfo.state = await promptGPT(fs.readFileSync('./gpt-prompts/extractState.txt', 'utf-8'), this.allText()).then(response => response.result)

    // //Zip
    // this.metadata.extractedInfo.zip = await promptGPT(fs.readFileSync('./gpt-prompts/extractZip.txt', 'utf-8'), this.allText()).then(response => response.result)

    // //Price
    // this.metadata.extractedInfo.price = await promptGPT(fs.readFileSync('./gpt-prompts/extractPrice.txt', 'utf-8'), this.allText()).then(response => response.result)

    // //ARV (If SFH)
    // if (this.metadata.category.predictedResult === 'SFH Deal') {
    //     this.metadata.extractedInfo.arv = await promptGPT(fs.readFileSync('./gpt-prompts/extractARV.txt', 'utf-8'), this.allText()).then(response => response.result)
    // } else {
    //     this.metadata.extractedInfo.arv = null
    // }

    if (extractedInfo.zip && !extractedInfo.state) {
        const zipSearch = await axios.get(`http://api.zippopotam.us/us/${extractedInfo.zip}`).then(response => response.data)

        extractedInfo.state = zipSearch.places[0]['state abbreviation']
        extractedInfo.city = zipSearch.places[0]['place name']
    }

    if (!extractedInfo.zip && !extractedInfo.state) {
        const group = await groupsCollection.findOne({ id: this.group.id })
        extractedInfo.state = group.impliedState
    }

    const deal = new Deal({
        category: predictionResult.category,
        address: {
            streetNumber: extractedInfo.streetNumber,
            streetName: extractedInfo.streetName,
            city: extractedInfo.city,
            state: extractedInfo.state,
            zip: extractedInfo.zip,
        },
        price: extractedInfo.price,
        arv: predictionResult.category != 'Land Deal' ? extractedInfo.arv : undefined,
        priceToARV: extractedInfo.price && extractedInfo.arv && predictionResult.category != 'Land Deal' ? extractedInfo.price / extractedInfo.arv : undefined,
        associatedPost: this._id
    })

    this.metadata.associatedDeal = deal._id

    await deal.save()
}

postSchema.methods.extractEmails = async function() {
    let searchText = this.allText()

    if (this.comments) {
        this.comments.forEach(comment => {
            searchText += `\n${comment.text}`

            processReplies(comment.replies)

            function processReplies(replies) {
                replies.forEach(reply => {
                    searchText += `\n${reply.text}`

                    processReplies(reply.replies)
                })
            }
        })
    }

    const emails = new Set(searchText.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g) || [])

    for (const email of emails) {
        const existingEmailDoc = await Email.findOne({ email })

        if (!existingEmailDoc) {
            const emailDoc = new Email({
                email,
                post: this._id
            })

            console.log('Found Email:', email)

            await emailDoc.save()
        }
    }

    this.metadata.checkedForEmails = true
}

export default mongoose.model('Post', postSchema)




async function promptGPT(systemPrompt, userPrompt) {
    return await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: userPrompt
            }
        ],
        temperature: 0,
        response_format: {
            type: 'json_object'
        }
    })
    .then(response => JSON.parse(response.choices[0].message.content))
}