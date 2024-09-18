import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)


const emailSchema = new mongoose.Schema({
    email: String,
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    foundAt: {
        type: Date,
        default: new Date
    },
    contextAddress: {
        streetName: String,
        streetNumber: String,
        city: String,
        state: String,
        zip: String
    },
    sold: {
        type: Boolean,
        default: false
    }
})

export default mongoose.model('Email', emailSchema)