const logic = require('../../logic')

module.exports = async function (req, res) {

    const { params: { gameId }, userId } = req

    try {
        const game = await logic.dealHand(gameId, userId)
        res.status(200).json({ message: `Game ${gameId} has started.` })
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}



























