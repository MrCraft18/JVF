import jwt from 'jsonwebtoken'
import RefreshToken from '../schemas/RefreshToken.js'
import { configDotenv } from 'dotenv'; configDotenv()

export default (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const authToken = authHeader && authHeader.split(' ')[1]

        if (!authToken) return res.sendStatus(401)

        jwt.verify(authToken, process.env.ACCESS_TOKEN_SECRET, async (error, data) => {
            if (error) return res.sendStatus(401)

            const storedParentToken = await RefreshToken.findOne({ token: data.parentToken })

            if (!storedParentToken) {
                console.log(data.parentToken)
                console.log('its in atuthenticateAccessToken')
                return res.sendStatus(403)
            }

            req.user = data.user
            next()
        })
    } catch (error) {
        console.error(error)
        res.sendStatus(500)
    }
}
