import jwt from 'jsonwebtoken'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()

const databaseClient = new MongoClient(process.env.MONGODB_URI)
const refreshTokensCollection = databaseClient.db('JVF').collection('refreshTokens')
const usersCollection = databaseClient.db('JVF').collection('users')

export default async (req, res, next) => {
    if (!req.cookies.refreshToken) return res.sendStatus(401)

    const storedRefreshToken = await refreshTokensCollection.findOne({ token: req.cookies.refreshToken })

    console.log(storedRefreshToken)

    if (!storedRefreshToken) {
        console.log('Refresh Token doesnt exist sent 401')

        return res.sendStatus(401)
    }

    jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, data) => {
        if (error) {
            console.log(error)
            return res.sendStatus(401)
        }

        if (data.ip !== req.ip) return res.sendStatus(403)

        next()

        // console.log(req.url)

        if (req.path.includes('/pages/')) {
            const user = await usersCollection.findOne({ _id: new ObjectId(data.id) }, { projection: { name: 1} })

            console.log(`${user.name.first} ${user.name.last} Successfully Reached ${req.url}`)
        }
    })
}