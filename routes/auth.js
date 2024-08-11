import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoClient, ObjectId } from 'mongodb'
import { configDotenv } from 'dotenv'; configDotenv()

const databaseClient = new MongoClient(process.env.MONGODB_URI)
const usersCollection = databaseClient.db('JVF').collection('users')
const refreshTokensCollection = databaseClient.db('JVF').collection('refreshTokens')

const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        if (!req.body.name.first || !req.body.name.first) return res.status(400).send("Missing Name")

        if (!req.body.password) return res.status(400).send("Missing Password")

        const foundUser = await usersCollection.findOne({ 'name.first': req.body.name.first, 'name.last': req.body.name.last }, { projection: { password: 1 } })

        if (!foundUser) return res.status(404).send("User Does Not Exist")

        if (await bcrypt.compare(req.body.password, foundUser.password)) {
            const refreshToken = jwt.sign({ id: foundUser._id.toString(), ip: req.ip }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' })

            await refreshTokensCollection.insertOne({ token: refreshToken, createdAt: new Date() })

            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 3  })
            res.sendStatus(200)
        } else {
            res.status(400).send("Incorrect Password")
        }

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/accessToken', async (req, res) => {
    try {
        if (!req.cookies.refreshToken) return res.sendStatus(401)

        const storedRefreshToken = await refreshTokensCollection.findOneAndDelete({ token: req.cookies.refreshToken })

        if (!storedRefreshToken) return res.sendStatus(403)

        jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, data) => {
            if (error || data.ip !== req.ip) return res.sendStatus(403)

            const user = await usersCollection.findOne({ _id: new ObjectId(data.id) }, { projection: { password: 0 } })

            const newRefreshToken = jwt.sign({ id: data.id, ip: req.ip }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' })
            const accessToken = jwt.sign({ user, ip: req.ip, parentToken: newRefreshToken }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' })

            await refreshTokensCollection.insertOne({ token: newRefreshToken, createdAt: new Date() })

            res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 3 })
            res.json({ accessToken })
        })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/logout', async (req, res) => {
    try {
        await refreshTokensCollection.deleteOne({ token: req.cookies.refreshToken })
        res.clearCookie('refreshToken')
        res.sendStatus(204)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

export default router