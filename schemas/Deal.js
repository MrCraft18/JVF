import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)

const dealSchema = mongoose.Schema({
    category: String,
    raisedIssues: {
        type: Map,
        of: {
            type: [String],
            default: []
        }
    },
    address: {
        streetName: String,
        streetNumber: String,
        city: String,
        state: String,
        zip: String
    },
    price: Number,
    arv: Number,
    associatedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    }
})

export default mongoose.model('Deal', dealSchema)
