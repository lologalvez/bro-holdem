const logic = require('../../logic')
const jwt = require('jsonwebtoken')

const { env: { JWT_SECRET } } = process

module.exports = async function (req, res) {

    const { body: { email, password } } = req

    try {

        const id = await logic.authenticateUser(email, password)
        const token = jwt.sign({ sub: id }, JWT_SECRET)
        res.json({ message: 'User authenticated successfully', id, token })

    } catch ({ message }) {
        res.status(401).json({ error: message })
    }
}