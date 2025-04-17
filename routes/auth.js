import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import User from '../schemas/User.js'
import RefreshToken from '../schemas/RefreshToken.js'
import { configDotenv } from 'dotenv'; configDotenv()

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

import authenticateRefreshToken from '../middleware/authenticateRefreshToken.js'

const router = express.Router()

router.post('/login', async (req, res) => {
    try {
        console.log(new Date())
        console.log(req.body)

        if (!req.body.email) return res.status(400).send("Missing Email")

        if (!req.body.password) return res.status(400).send("Missing Password")

        const foundUser = await User.findOne(
            {
              'email': { $regex: new RegExp(`^${req.body.email.trim()}$`, 'i') },
            },
            { password: 1, _id: 1, admin: 1, stripeCustomerID: 1 }
        )

        if (!foundUser) return res.status(404).send("User Does Not Exist")

        if (!foundUser.admin) {
            const subscriptions = await stripe.subscriptions.list({
                customer: foundUser.stripeCustomerID,
                status: "all",
                limit: 1
            })

            const subscriptionStatus = subscriptions.data.some(subscription => (subscription.status === "active" || subscription.status === "trialing") && subscription.plan.product === "prod_S8WY6ZjEB0eVcw")

            if (!subscriptionStatus) return res.status(403).send("No Active Subscription")
        }

        if (bcrypt.compareSync(req.body.password.trim(), foundUser.password)) {
            const refreshToken = jwt.sign({ id: foundUser._id.toString(), stripeCustomerID: foundUser.stripeCustomerID, admin: foundUser.admin }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' })

            await new RefreshToken({ token: refreshToken }).save()

            res.cookie('refreshToken', refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 3 })
            res.sendStatus(200)
        } else {
            res.status(400).send("Incorrect Password")
        }

    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/accessToken', authenticateRefreshToken, async (req, res) => {
    try {
        const user = await User.findById(req.userID, { email: 1, admin: 1 })

        if (!user) return res.sendStatus(401)

        const newRefreshToken = jwt.sign({ id: req.userID, stripeCustomerID: user.stripeCustomerID, admin: user.admin }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' })
        const accessToken = jwt.sign({ user, parentToken: newRefreshToken }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '5m' })

        await RefreshToken.deleteOne({ token: req.cookies.refreshToken })
        await new RefreshToken({ token: newRefreshToken }).save()

        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 3 })
        res.json({ accessToken })

        user.lastTokenAccess = new Date()
        await user.save()
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

router.post('/logout', async (req, res) => {
    try {
        await RefreshToken.deleteOne({ token: req.cookies.refreshToken })
        res.clearCookie('refreshToken')
        res.sendStatus(204)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
})

export default router
