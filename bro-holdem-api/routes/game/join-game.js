const logic = require('../../logic')

module.exports = async function (req, res) {

    const { params: { gameId }, userId } = req

    try {
        const { userName, gameName } = await logic.joinGame(gameId, userId)
        res.status(201).json({ message: `${userName} has joined the game ${gameName}.` })
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}






























