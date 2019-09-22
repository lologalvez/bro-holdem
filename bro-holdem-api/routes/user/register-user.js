const logic = require('../../logic')

module.exports = async function (req, res) {

    const { body: { username, email, password } } = req

    try {
        const userId = await logic.registerUser(username, email, password)
        res.status(201).json({ message: 'User registered successfully', userId })
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}