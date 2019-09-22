const logic = require('../../logic')

module.exports = async function (req, res) {

    const { body: { name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease }, userId } = req

    try {
        const gameId = await logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, userId)
        res.status(201).json({ message: 'Game created successfully', gameId })
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}






























