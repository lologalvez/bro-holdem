const logic = require('../../logic')

module.exports = async function (req, res) {

    const { params: { gameId } } = req

    try {
        const { message, stage } = await logic.updateTurn(gameId)
        res.status(200).json({ message, stage })
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}



























