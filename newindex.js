import FacebookJS from 'facebook.js'
import Post from './schemas/Post.js'
import Group from './schemas/Group.js'
import FacebookAccount from './schemas/FacebookAccount.js'
import io from 'socket.io-client'
import { configDotenv } from 'dotenv'; configDotenv()

const socket = io(`http://localhost:${process.env.PORT}`, {
    auth: {
        clientType: 'scraper',
        key: process.env.SCRAPER_WS_KEY
    }
})

async function main() {
    await new Promise(res => setTimeout(res, getDelay()))

    const groupDocs = await Group.find()

    const facebook = new FacebookJS({ headless: true, maxConcurrentTasks: 2, allowAccountConcurrentTaks: false })

    await Promise.all(groupDocs.map(group => {
        return new Promise(async resolve => {
            const fbContext = await (async () => {
                if (group.isPrivate) {
                    const account = await FacebookAccount.findOne({
                        suspended: false,
                        $or: [
                            { noGroupAccessOn: { $exists: false } },
                            { noGroupAccessOn: new Date(new Date().setDate(new Date().getDate() - 1)) }
                        ],
                        assignedGroups: { $includes: group.id }
                    }).sort({ createdAt: 1 })

                    return facebook.createContext({ account, proxy: account.proxy })
                } else {
                    return facebook.createContext({ proxy })
                }
            })()

            let skipDelay = true
            while (!getDelay()) {
                if (skipDelay) {
                    skipDelay = false
                } else {
                    const minWait = 1000 * 60 * 15
                    const maxWait = 1000 * 60 * 60
                    await new Promise(res => setTimeout(res, Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait))
                }

                try {
                    const lastScrapedPost = await Group.findOne({ id: group.id }).select('lastScrapedPost').then(doc => doc.lastScrapedPost)

                    console.log('\n', 'GROUP: ', JSON.stringify(group), new Date().toLocaleString())

                    const posts = await fbContext.group(group.id).posts({
                        dateRange: {
                            minDate: lastScrapedPost && Math.abs(lastScrapedPost.createdAt - new Date()) / (1000 * 60 * 60) < 24 ? lastScrapedPost.createdAt : new Date(Date.now() - (1000 * 60 * 60 * 24))
                        },
                        sorting: 'new'
                    })

                    for (const postData of posts) {
                        const post = new Post(postData)

                        const existingPostDocument = await Post.findOne({ id: post.id, 'group.id': post.group.id })

                        if (existingPostDocument) {
                            continue
                        }

                        if (!await post.checkIfDupilcate()) {
                            const deal = await post.getDeal()
                            if (deal) await deal.save()
                        }

                        console.log('POST: ', post.metadata.associatedDeal ? 'DEAL' : '', post.metadata.duplicateOf ? 'DUPLICATE' : '', { name: post.author.name, id: post.id }, post.group.name, new Date(post.createdAt).toLocaleString())

                        await post.save()
                    }

                    //Update last scraped post group document if everything went well.
                    if (posts.length) Group.updateOne({ id: group.id }, { $set: { lastScrapedPost: posts[0] } })
                } catch (error) {
                    const expectedMessages = [
                        'Facebook Account doesnt have read access to Group.',
                        'Facebook Account is suspended',
                        'IP is blocked'
                    ]

                    if (expectedMessages.find(expectedMessage => error.message.includes(expectedMessage))) {
                        skipDelay = true

                        if (error.message === 'Facebook Account doesnt have read access to Group.') account.noGroupAccessOn = new Date()

                        if (error.message === 'Facebook Account is suspended') account.suspended = true

                        await account.save()
                    } else {
                        console.log(`Stopped Group Checking for ${group.id} due to unknown error: ${error}`)
                        break
                    }
                }
            }

            resolve()
        })
    }))

    //Run email scrape

    main()
}
main()



function getDelay() {
    const now = new Date()
    const targetTime = new Date(now).setHours(8, 0, 0, 0)
    const endOfWorkDay = new Date(now).setHours(17, 0, 0, 0)

    if (now >= targetTime && now <= endOfWorkDay) {
        return 0
    }

    if (now > endOfWorkDay) {
        targetTime.setDate(targetTime.getDate() + 1)
    }

    return targetTime - now
}