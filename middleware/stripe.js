import bcrypt from 'bcryptjs'
import Stripe from 'stripe'
import User from '../schemas/User.js';
import { configDotenv } from 'dotenv'; configDotenv()

const stripe = Stripe(process.env.STRIPE_SECRET_KEY)

export default async (req, res) => {
    try {
        const event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_SIGNING_SECRET)

        //console.log(event)

        switch (event.type) {
            case "checkout.session.completed":
                //Check if existing user has customer ID or email

                const password = event.data.object.custom_fields.find(field => field.key === "setreventurespassword").text.value

                const hashedPassword = await bcrypt.hash(password, 10)

                await new User({
                    email: event.data.object.customer_details.email,
                    stripeCustomerID: event.data.object.customer,
                    password: hashedPassword,
                }).save()

                res.sendStatus(201) 

                console.log(`New Subscribed User: ${event.data.object.customer_details.email}`)

                break
            default:
                res.sendStatus(200)
                break
        }
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}
