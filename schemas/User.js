import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()


const userSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    password: String,
    role: String,
    dealsQuery: Object
})

export default mongoose.model('User', userSchema)