import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()


const groupSchema = new mongoose.Schema({
    id: String,
    impliedState: String,
    lastScrapedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
})

export default mongoose.model('Group', groupSchema)