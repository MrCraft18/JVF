import jwt from 'jsonwebtoken'
import RefreshToken from '../schemas/RefreshToken.js';
import { configDotenv } from 'dotenv'; configDotenv()

export default async (req, res, next) => {
    try {
        if (!req.cookies.refreshToken) return res.sendStatus(401)

        const storedRefreshToken = await RefreshToken.findOne({ token: req.cookies.refreshToken })

        if (!storedRefreshToken) {
            console.log('Refresh Token doesnt exist sent 401')
            return res.sendStatus(401)
        }

        jwt.verify(req.cookies.refreshToken, process.env.REFRESH_TOKEN_SECRET, async (error, data) => {
            if (error) {
                console.log(error)
                return res.sendStatus(401)
            }

            if (data.ip !== req.ip) {
                console.log('its in authenticateRefreshToken')
                return res.sendStatus(403)
            }

            req.userID = data.id

            next()
        })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}
