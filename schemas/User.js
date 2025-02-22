import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)


const userSchema = new mongoose.Schema({
    name: {
        first: String,
        last: String
    },
    password: String,
    role: String,
    dealsQuery: Object,
    blacklistedAuthors: Array,
    lastTokenAccess: Date
})

export default mongoose.model('User', userSchema)
