import express from 'express'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.resolve(path.dirname(__filename), '..')

const router = express.Router()

import authenticateRefreshToken from '../middleware/authenticateRefreshToken.js'

router.get('/', (req, res) => {
    res.redirect('/deals')
})

router.get('/login', sendDevicePage)
router.get('/deals', authenticateRefreshToken, sendDevicePage)

export default router
