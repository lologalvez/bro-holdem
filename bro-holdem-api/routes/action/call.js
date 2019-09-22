const logic = require('../../logic')

module.exports = async function (req, res) {

    const { params: { gameId }, userId } = req

    try {
        await logic.call(gameId, userId)
        // const { userName, gameName, callAmount } = await logic.call(gameId, userId)
        res.sendStatus(200)
        //res.status(200).json({ message: `${userName} called ${callAmount} and keeps playing hand in ${ gameName }.` })
    } catch ({ message }) {
        res.status(400).json({ error: message })
    }
}






























