import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()


const facebookAccountSchema = new mongoose.Schema({
    username: String,
    password: String,
    proxy: {
        address: String,
        port: String,
        username: String,
        password: String
    },
    assignedGroup: String,
    createdAt: {
        type: Date,
        default: new Date
    },
    suspended: Boolean,
    noGroupAccessOn: Date
})

export default mongoose.model('FacebookAccount', facebookAccountSchema, 'facebookAccounts')