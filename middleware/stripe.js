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
                console.log("Checkout Completed")

                if (event.data.object.payment_link !== "plink_1REhjkFExMqRmpqtBltKm65y") {
                    console.log("Subscription made from non deafault payment link")
                    break
                }

                const existingUser = await User.find({
                    or: [
                        { email: event.data.object.customer_details.email },
                        { stripeCustomerID: event.data.object.customer }
                    ]
                })

                if (existingUser) {
                    console.log(`User with ${existingUser.email} OR ${existingUser.stripeCustomerID}`)
                    break
                }

                const password = event.data.object.custom_fields.find(field => field.key === "setreventurespassword").text.value

                const hashedPassword = await bcrypt.hash(password, 10)

                await new User({
                    email: event.data.object.customer_details.email,
                    stripeCustomerID: event.data.object.customer,
                    password: hashedPassword,
                }).save()

                console.log(`New Subscribed User: ${event.data.object.customer_details.email}`)

                break
        }

        res.sendStatus(200)
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}
