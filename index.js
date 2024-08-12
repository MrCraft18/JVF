import Facebook from 'facebook.js'
import Post from './schemas/post.js'
import cron from 'node-cron'
import io from 'socket.io-client'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()
import './app.js'

const databaseClient = new MongoClient(process.env.MONGODB_URI)
const groupsCollection = databaseClient.db('JVF').collection('groups')

const socket = io(`http://localhost:${process.env.PORT}`, {
    auth: {
        clientType: 'scraper',
        key: process.env.SCRAPER_WS_KEY
    }
})

let withinOperatingTime = false

cron.schedule('30 8 * * *', () => {
    withinOperatingTime = true
    scrapePostsLoop()
}, { timezone: 'America/Chicago' })


cron.schedule('30 16 * * *', () => {
    withinOperatingTime = false
}, { timezone: 'America/Chicago' })


const currentTime = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/Chicago',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
})

const [hour, minute] = currentTime.split(':').map(Number)

if ((hour > 8 || (hour === 8 && minute >= 30)) && (hour < 16 || (hour === 16 && minute <= 30))) {
    withinOperatingTime = true
    scrapePostsLoop()
} else {
    socket.emit('scraperSleep')
    console.log('Sleeping')

    // withinOperatingTime = true
    // scrapePostsLoop()
}

async function scrapePostsLoop() {
    console.log('Starting Scraper Loop')
    socket.emit('scraperStart')

    const fb = await Facebook.login(process.env.FB_USER, process.env.FB_PASS, { headless: true, defaultRetries: 5 })

    const groups = await fb.getJoinedGroups()

    for (const group of groups) {
        await groupsCollection.findOneAndUpdate({ id: group.id }, { $set: { ...group } }, { upsert: true })
    }

    let checkQueue = shuffleArray([...groups])

    while (withinOperatingTime) {
        const group = checkQueue.shift()

        try {
            const lastScrapedPost = await groupsCollection
                .findOne({ id: group.id }, { projection: { lastScrapedPost: 1, _id: 0 } })
                .then(response => response.lastScrapedPost)

            console.log('\n', JSON.stringify(group), new Date().toLocaleString())

            if (lastScrapedPost && differenceInHours(lastScrapedPost.createdAt, new Date()) < 24) {
                var endDate = lastScrapedPost.createdAt
            } else if (lastScrapedPost && differenceInHours(lastScrapedPost.createdAt, new Date()) > 24 || !lastScrapedPost) {
                var endDate = new Date(Date.now() - (1000 * 60 * 60 * 24))
            }

            const posts = await fb.getGroupPosts(group.id, { dateRange: { endAfter: endDate }, sorting: 'new' })

            for (const postObj of posts) {
                const post = new Post(postObj)

                const existingPostDocument = await Post.findOne({ id: post.id, 'group.id': post.group.id })

                if (existingPostDocument) continue

                if (!await post.checkIfDupilcate()) await post.getDeal()

                console.log(post.metadata.associatedDeal ? 'DEAL' : '', post.metadata.duplicateOf ? 'DUPLICATE' : '', { name: post.author.name, id: post.id }, post.group.name, new Date(post.createdAt).toLocaleString())

                await post.save()
            }

            if (posts.length > 0) {
                await groupsCollection.updateOne({ id: group.id }, { $set: { lastScrapedPost: posts[0] } })
            }
        } catch (error) {
            error.caught = "Moving on to check next group."

            console.log(error)
        } finally {
            if (checkQueue.length === 0) checkQueue = shuffleArray([...groups])

            await new Promise(resolve => setTimeout(resolve, 5000))
        }
    }

    console.log('Done Looping')

    //Extract emails from posts that are 3 days old and havent been marked already extracted
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

    const posts = await Post.find({ 'metadata.checkedForEmails': false, createdAt: { $lte: threeDaysAgo } })

    console.log(posts.length)

    for (const post of posts) {
        console.log('Checking Post:', post.id)
        post.comments = await fb.getGroupPostComments(post.id, post.group.id)

        await post.extractEmails()

        await post.save()
    }

    console.log('Done Checking Posts')

    await fb.close()

    socket.emit('scraperSleep')
    console.log('Sleeping')



    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function differenceInHours(date1, date2) {
        return Math.abs(date2 - date1) / (1000 * 60 * 60)
    }
}
