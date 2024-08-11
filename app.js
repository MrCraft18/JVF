import express from "express"
import { Server as IoServer } from 'socket.io'
import { fileURLToPath } from 'url'
import path from 'path'
import { configDotenv } from 'dotenv'; configDotenv()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

//Import and use Middleware
import cookieParser from 'cookie-parser'
import useragent from 'express-useragent'
import authenticateAccessToken from './middleware/authenticateAccessToken.js'
import authenticateRefreshToken from "./middleware/authenticateRefreshToken.js";
app.use(express.json())
app.use(cookieParser())
app.use(useragent.express())

//Import and use Routes
import authRouter from './routes/auth.js'
import apiRouter from './routes/api.js'
app.use('/auth', authRouter)
app.use('/api', authenticateAccessToken, apiRouter)

app.get('*', (req, res, next) => {
    if (req.headers['accept']?.includes('text/html')) {
        res.sendFile(path.join(__dirname, 'src', 'public', 'router.html'))
    } else {
        next()
    }
})

app.use(express.static(path.join(__dirname, 'src', 'public')))
app.use(authenticateRefreshToken, express.static(path.join(__dirname, 'src', 'protected')))

const port = process.env.PORT
const server = app.listen(port, () => {
    console.log("Server Listening on: " + port)
})

let scraperStatus = 'Disconnected'

const io = new IoServer(server)

io.on('connection', socket => {
    if (socket.handshake.auth.clientType === 'scraper') {
        if (socket.handshake.auth.key != process.env.SCRAPER_WS_KEY) {
            socket.emit('disconnectReason', { message: 'Forbidden' })
            socket.disconnect(true)
        }

        console.log('Facebook Scraper is Connected')
    } else if (socket.handshake.auth.clientType === 'userClient') {

    } else {
        socket.emit('disconnectReason', { message: 'Unknown Client Type' })
        socket.disconnect(true)
    }

    //Update status of post scraper

    socket.on('scraperStart', () => {
        scraperStatus = 'Active'
        console.log(`Scraper Status is: ${scraperStatus}`)
    })

    socket.on('scraperSleep', () => {
        scraperStatus = 'Sleeping'
        console.log(`Scraper Status is: ${scraperStatus}`)
    })

    socket.on('disconnect', () => {
        if (socket.handshake.auth.clientType === 'scraper') {
            scraperStatus = 'Disconnected'
            console.log(`Scraper Status is: ${scraperStatus}`)
        }
    })
})