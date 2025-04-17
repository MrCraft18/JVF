import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)


const userSchema = new mongoose.Schema({
    email: String,
    stripeCustomerID: {
        type: String,
        required: false
    },
    password: String,
    admin: { 
        type: String,
        required: false,
    },
    dealsQuery: Object,
    blacklistedAuthors: Array,
    lastTokenAccess: Date
})

export default mongoose.model('User', userSchema)
