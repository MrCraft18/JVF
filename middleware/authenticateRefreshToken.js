import jwt from 'jsonwebtoken'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()

const databaseClient = new MongoClient(process.env.MONGODB_URI)
const refreshTokensCollection = databaseClient.db('JVF').collection('refreshTokens')

export default async (req, res, next) => {
    if (!req.cookies.refreshToken) return res.redirect('/login')

    const storedRefreshToken = await refreshTokensCollection.findOneAndDelete({ token: req.cookies.refreshToken })

    if (!storedRefreshToken) return res.clearCookie('refreshToken').redirect('/login')

    jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, data) => {
        if (error || data.ip !== req.ip) return res.clearCookie('refreshToken').redirect('/login')

        const newRefreshToken = jwt.sign({ id: data.id, ip: req.ip }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' })

        await refreshTokensCollection.insertOne({ token: newRefreshToken, createdAt: new Date() })

        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 3 })
        next()
    })
}