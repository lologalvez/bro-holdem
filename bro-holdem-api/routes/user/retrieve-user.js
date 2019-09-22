const logic = require('../../logic')
const jwt = require('jsonwebtoken')

module.exports = async function (req, res) {

    const { userId } = req

    try {
        const user = await logic.retrieveUser(userId)
        res.json({ message: 'User retrieved successfully', user })
    } catch ({ message }) {
        res.status(401).json({ error: message })
    }
}