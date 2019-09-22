const jwt = require('jsonwebtoken')

const { env: { JWT_SECRET } } = process

module.exports = (req, res, next) => {
    try {

        const { headers: { authorization } } = req

        if (!authorization) throw new Error('No authorization token received')

        const token = authorization.slice(authorization.indexOf(' ') + 1)

        const { sub } = jwt.verify(token, JWT_SECRET)

        req.userId = sub

        next()

    } catch ({ message }) {
        res.status(401).json({ error: message })
    }
}