const logic = require('../../logic')

module.exports = async function (req, res) {

    const { params: { gameId }, userId } = req

    try {
        await logic.fold(gameId, userId)
        res.sendStatus(200)
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}






























