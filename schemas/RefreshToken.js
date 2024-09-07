import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()


const refreshTokensSchema = new mongoose.Schema({
    token: String,
    createdAt: {
        type: Date,
        default: new Date
    }
})

export default mongoose.model('RefreshTokens', refreshTokensSchema)