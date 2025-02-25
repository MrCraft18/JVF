import FacebookJS from 'facebook.js'
import Post from './schemas/Post.js'
import Group from './schemas/Group.js'
import FacebookAccount from './schemas/FacebookAccount.js'
import io from 'socket.io-client'
import { configDotenv } from 'dotenv'; configDotenv()

// const socket = io(`http://localhost:${process.env.PORT}`, {
//     auth: {
//         clientType: 'scraper',
//         key: process.env.SCRAPER_WS_KEY
//     }
// })

async function main() {
    await new Promise(res => setTimeout(res, getDelay()))

    console.log('Hero we go bois.')

    const groups = await Group.find({ impliedState: "TX" })

    const facebook = new FacebookJS({ headless: false, allowAccountConcurrentTasks: false })

    const accounts = await FacebookAccount.find({ enabled: true })


    await Promise.all(accounts.map(async account => {
        try {
            await facebook.createContext({
                account,
                fingerprint: account.fingerprint,
                remoteBrowserEndpoint: account.remoteBrowserEndpoint,
                storageState: account.storageState,
                onStorageUpdate: async function (storageState) {
                    account.storageState = storageState
                    await account.save()
                }
            })

            if (account.suspended) {
                account.suspended = false
                await account.save()
            }
        } catch (error) {
            console.log(error)
            if (error.message.includes('Facebook Account is suspended')) {
                if (!account.suspended) {
                    account.suspended = true
                    await account.save()
                }
            }
        }

        //get joined groups
        // await context.getJoinedGroups()
    }))

    console.log(facebook.scrapingContexts.length)

    await Promise.all(groups.map(async group => {
        let skipDelay = true
        while (!getDelay()) {
            if (skipDelay) {
                skipDelay = false
            } else {
                const minWait = 1000 * 60 * 45
                const maxWait = 1000 * 60 * 60
                await new Promise(res => setTimeout(res, Math.floor(Math.random() * (maxWait - minWait + 1)) + minWait))
            }

            const account = (await FacebookAccount.aggregate([
                {
                    $match: {
                        username: { $in: facebook.scrapingContexts.filter(context => context.browser.isConnected()).map(context => context.account.username) },
                        suspended: false,
                        unavailableContentGroups: { $nin: [group.id] },
                        ...(group.private && { joinedGroups: group.id })
                    }
                },
                { $sample: { size: 1 } }
            ]))[0]

            if (!account) {
                console.log(`No eligible Facebook Account for Group: ${group.id} stopping checks.`)
                return
            }

            const fbContext = facebook.scrapingContexts.find(context => context.account.username === account.username)

            try {
                const lastScrapedPost = (await Group.findOne({ id: group.id }).populate('lastScrapedPost')).lastScrapedPost

                console.log('\n', 'GROUP: ', JSON.stringify(group), new Date().toLocaleString())

                const posts = await fbContext.group(group.id).findPosts({
                    dateRange: {
                        min: lastScrapedPost && Math.abs(lastScrapedPost.createdAt - new Date()) / (1000 * 60 * 60) < 24 ? lastScrapedPost.createdAt : new Date(Date.now() - (1000 * 60 * 60 * 24))
                    },
                    sorting: 'new'
                })

                console.log(facebook.taskQueue.length, `Checked with ${account.username}`)
                console.log(facebook.scrapingContexts.length)

                for (let i = 0; i < posts.length; i++) {
                    const post = new Post(posts[i])

                    const existingPostDocument = await Post.findOne({ id: post.id, 'group.id': post.group.id })

                    if (existingPostDocument) {
                        continue
                    }

                    console.log('ayo')

                    if (!await post.checkIfDupilcate()) {
                        console.log('ayo2')
                        await post.getDeal()
                    }

                    console.log('ayo3')

                    console.log('POST: ', post.metadata.associatedDeal ? 'DEAL' : '', post.metadata.duplicateOf ? 'DUPLICATE' : '', { name: post.author.name, id: post.id }, post.group.name, new Date(post.createdAt).toLocaleString())

                    await post.save()

                    if (i + 1 === posts.length) {
                        group.lastScrapedPost = post._id
                        await group.save()
                    }
                }
            } catch (error) {
                const expectedMessages = [
                    "Browser Server got disconnected.",
                    'Facebook Account is suspended',
                    "Group content isn't available",
                    'Facebook Account doesnt have read access to Group',
                    'ERR_TUNNEL_CONNECTION_FAILED',
                    'ERR_HTTP_RESPONSE_CODE_FAILURE',
                    'Timeout',
                    'ECONNRESET'
                ]

                if (expectedMessages.find(expectedMessage => error.message.includes(expectedMessage))) {
                    console.log(error)

                    skipDelay = true

                    if (error.message.includes('ERR_TUNNEL_CONNECTION_FAILED') || error.message.includes('ERR_HTTP_RESPONSE_CODE_FAILURE') || error.message.includes('ECONNRESET')) {
                        fbContext.proxyFailedAt = new Date()
                        return
                    }

                    if (error.message.includes("Facebook Account doesnt have read access to Group")) {
                        await Group.updateOne({ id: group.id }, { $set: { private: true } })
                        return
                    }

                    const account = await FacebookAccount.findOne({ username: fbContext.account.username })

                    if (error.message.includes("Group content isn't available")) account.unavailableContentGroups.push(group.id)

                    if (error.message.includes('Facebook Account is suspended')) {
                        account.suspended = true
                        await fbContext.close()
                    }

                    await account.save()
                } else {
                    console.log(`Stopped Group Checking for ${group.id} due to unknown error:\n`, error)
                    break
                }
            }
        }
    }))

    //Extract emails from posts that are a week old and havent been marked already extracted
    //const weekAgo = new Date()
    //weekAgo.setDate(weekAgo.getDate() - 4)
    //
    //const posts = await Post.find({ 'metadata.checkedForEmails': false, createdAt: { $lte: weekAgo } })
    //
    //console.log(posts.length)
    //
    //let i = 0
    //while (i < posts.length) {
    //    const post = posts[i]
    //
    //    const group = await Group.findOne({ id: post.group.id })
    //
    //    if (!group) {
    //        i++
    //        continue
    //    }
    //
    //    const account = (await FacebookAccount.aggregate([
    //        {
    //            $match: {
    //                username: { $in: facebook.scrapingContexts.filter(context => context.browser.isConnected()).map(context => context.account.username) },
    //                suspended: false,
    //                unavailableContentGroups: { $nin: [group.id] },
    //                ...(group.private && { joinedGroups: group.id })
    //            }
    //        },
    //        { $sample: { size: 1 } }
    //    ]))[0]
    //
    //    if (!account) {
    //        console.log(`No eligible Facebook Account for Group: ${group.id} can't get emails for ${post.id}.`)
    //        i++
    //        continue
    //    }
    //
    //    const fbContext = facebook.scrapingContexts.find(context => context.account.username === account.username && context.browser.isConnected())
    //
    //    try {
    //        post.comments = await fbContext.group(post.group.id).post(post.id).getComments()
    //
    //        await post.extractEmails()
    //
    //        await post.save()
    //
    //        console.log('Checked Post:', post.id, account.username, posts.length - (i + 1))
    //
    //        i++
    //    } catch (error) {
    //        console.log(error)
    //
    //        const expectedMessages = [
    //            'Facebook Account is suspended',
    //            "Post content isn't available",
    //            "Browser Server got disconnected.",
    //            // 'Facebook Account doesnt have read access to Group',
    //            'ERR_TUNNEL_CONNECTION_FAILED',
    //            'ERR_HTTP_RESPONSE_CODE_FAILURE',
    //            'Timeout',
    //            'ECONNRESET'
    //        ]
    //
    //        if (expectedMessages.find(expectedMessage => error.message.includes(expectedMessage))) {
    //            if (error.message.includes('Facebook Account is suspended')) {
    //                const account = await FacebookAccount.findOne({ username: fbContext.account.username })
    //                account.suspended = true
    //                await account.save()
    //                await fbContext.close()
    //            }
    //
    //            if (error.message.includes("Post content isn't available")) {
    //                post.metadata.checkedForEmails = true
    //                await post.save()
    //                i++
    //            }
    //        }
    //    }
    //}

    await facebook.close()

    console.log('Done Checking Posts', new Date().toLocaleString())

    main()
}
main()



function getDelay() {
    const now = new Date()
    const targetTime = new Date(now)
    targetTime.setHours(9, 0, 0, 0) //CHANGE BACK TO 9

    const endOfWorkDay = new Date(now)
    endOfWorkDay.setHours(16, 0, 0, 0) //CHANGE BACK TO 16

    if (now >= targetTime && now <= endOfWorkDay) {
        return 0
    }

    if (now > endOfWorkDay) {
        targetTime.setDate(targetTime.getDate() + 1)
    }

    return targetTime - now
}
