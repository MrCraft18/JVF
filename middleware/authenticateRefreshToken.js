import jwt from 'jsonwebtoken'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()

const databaseClient = new MongoClient(process.env.MONGODB_URI)
const refreshTokensCollection = databaseClient.db('JVF').collection('refreshTokens')
const usersCollection = databaseClient.db('JVF').collection('users')

export default async (req, res, next) => {
    if (!req.cookies.refreshToken) return res.redirect('/login')

    const storedRefreshToken = await refreshTokensCollection.findOne({ token: req.cookies.refreshToken })

    if (!storedRefreshToken) return res.redirect('/login') //return res.clearCookie('refreshToken').redirect('/login')

    jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, data) => {
        if (error || data.ip !== req.ip) return res.redirect('/login') //return res.clearCookie('refreshToken').redirect('/login')

        next()

        // console.log(req.url)

        if (!req.path.endsWith('.js')) {
            const user = await usersCollection.findOne({ _id: new ObjectId(data.id) }, { projection: { name: 1} })

            console.log(`${user.name.first} ${user.name.last} Successfully Reached ${req.url}`)
        }
    })
}