const logic = require('../../logic')

module.exports = async function (req, res) {

    const { body: { raiseAmount }, params: { gameId }, userId } = req

    const raiseTo = Number(raiseAmount)

    try {
        await logic.raise(gameId, userId, raiseTo)
        res.sendStatus(200)
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}






























