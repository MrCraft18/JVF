import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)


const refreshTokensSchema = new mongoose.Schema({
    token: String,
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 3
    }
})

export default mongoose.model('RefreshToken', refreshTokensSchema, 'refreshTokens')
