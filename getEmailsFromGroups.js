import Post from './schemas/Post.js'
import Group from './schemas/Group.js'
import FacebookAccount from './schemas/FacebookAccount.js'
import fs from 'fs'
import FacebookJS from 'facebook.js'
import { configDotenv } from 'dotenv'; configDotenv()

let groups = fs.readFileSync('./groups.txt', 'utf-8').split('\n')

const facebook = new FacebookJS({ headless: false, maxConcurrentTasks: 2, allowAccountConcurrentTasks: false })

while (groups.length) {
    const group = await Group.findOne({ id: groups.shift() })

    const { username, password, proxy } = await FacebookAccount.findOne(group.private ? { joinedGroups: { $includes: group.id }, suspended: false } : { suspended: false })

    const fbContext = await facebook.createContext({ account: { username, password }, proxy })

    let counter = 0

    await fbContext.group(group.id).findPosts({ dateRange: { min: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 6) }, sorting: 'activity', getComments: true }, async postData => {
        const post = new Post(postData)

        const emails = await post.extractEmails()

        console.log(counter++, post.createdAt.toLocaleString())
    })

    await fbContext.close()

    fs.writeFileSync('./groups.txt', groups.join('\n'))
}

await facebook.close()

console.log('dun')