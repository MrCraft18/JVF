import jwt from 'jsonwebtoken'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()

const databaseClient = new MongoClient(process.env.MONGODB_URI)
const refreshTokensCollection = databaseClient.db('JVF').collection('refreshTokens')

export default (req, res, next) => {
    const authHeader = req.headers['authorization']
    const authToken = authHeader && authHeader.split(' ')[1]

    if (!authToken) return res.sendStatus(401)

    jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, async (error, data) => {
        const storedParentToken = await refreshTokensCollection.findOne({ token: data.parentToken })

        if (error || data.ip !== req.ip || !storedParentToken) {
            return res.sendStatus(403)
        }

        req.user = data.user
        next()
    })
}