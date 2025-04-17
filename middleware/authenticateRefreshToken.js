import jwt from 'jsonwebtoken'
import Stripe from 'stripe';
import RefreshToken from '../schemas/RefreshToken.js';
import { configDotenv } from 'dotenv'; configDotenv()

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

export default async (req, res, next) => {
    try {
        if (!req.cookies.refreshToken) return res.redirect(401)

        const storedRefreshToken = await RefreshToken.findOne({ token: req.cookies.refreshToken })

        if (!storedRefreshToken) {
            console.log('Refresh Token doesnt exist sent 401')
            return res.sendStatus(401)
        }

        jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, data) => {
            if (error) {
                console.log(error)
                return res.sendStatus(401)
            }

            req.userID = data.id

            if (!data.admin) {
                const subscriptions = await stripe.subscriptions.list({
                    customer: data.stripeCustomerID,
                    status: "all",
                    limit: 1
                })

                const subscriptionStatus = subscriptions.data.some(subscription => (subscription.status === "active" || subscription.status === "trialing") && subscription.plan.product === "prod_S8WY6ZjEB0eVcw")

                if (!subscriptionStatus) return res.status(403).send("No Active Subscription")
            }

            next()
        })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}
