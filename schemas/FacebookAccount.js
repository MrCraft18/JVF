import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)

const facebookAccountSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String,
    phone: String,
    proxy: {
        type: Object,
        default: undefined
    },
    joinedGroups: [String],
    unavailableContentGroups: [String],
    createdAt: {
        type: Date,
        default: new Date
    },
    suspended: {
        type: Boolean,
        default: false
    },
    fingerprint: Object
})

export default mongoose.model('FacebookAccount', facebookAccountSchema, 'facebookAccounts')