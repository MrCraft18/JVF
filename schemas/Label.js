import mongoose from "mongoose"
import { configDotenv } from 'dotenv'; configDotenv()

await mongoose.connect(process.env.MONGODB_URI)

const labelSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    label: { type: String, default: 'Unchecked' }
})

export default mongoose.model('Label', labelSchema)
