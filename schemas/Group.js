import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)


const groupSchema = new mongoose.Schema({
    id: String,
    impliedState: String,
    lastScrapedPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    private: Boolean
})

export default mongoose.model('Group', groupSchema)