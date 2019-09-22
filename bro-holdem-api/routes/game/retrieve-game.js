const logic = require('../../logic')

module.exports = async function (req, res) {

    const { params: { gameId } } = req

    try {
        const game = await logic.retrieveGame(gameId)
        res.status(200).json({ message: `Game ${gameId} retrieved correctly.`, game })
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}



























