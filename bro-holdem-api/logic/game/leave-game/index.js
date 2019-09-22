const { validate } = require('bro-holdem-utils')
const { models: { User, Game } } = require('bro-holdem-data')

/**
* 
* @param {*} gameId
* @param {*} userId
* 
* @returns {Promise}
*/

module.exports = function (gameId, userId) {

    validate.objectId(gameId, 'Game ID')
    validate.objectId(userId, 'User ID')

    return (async () => {

        // Find game
        const game = await Game.findById(gameId)
        if (!game) throw Error('Game does not exist.')

        const leavingPlayerIndex = game.players.findIndex(player => player && String(player.user) === userId)
        if (leavingPlayerIndex === -1) throw Error(`User with id ${userId} is not a player of game with id ${gameId}.`)

        const user = await User.findById(userId)
        if (!user) throw Error(`User does not exist.`)

        // Remove player from game
        game.players[leavingPlayerIndex] = null
        const remainingPlayers = game.players.filter(player => player && player)
        if (!remainingPlayers.length) return { userName: user.username, gameName: game.name }

        // Update turn position
        const currentHand = game.hands[game.hands.length - 1]

        let playersInHand, start
        if (currentHand) {
            if (currentHand.turnPos === leavingPlayerIndex) {
                playersInHand = Array.from(game.players.map((player, idx) => player ? player.inHand : false))
                start = (leavingPlayerIndex === game.players.length - 1) ? 0 : leavingPlayerIndex + 1
                currentHand.turnPos = playersInHand.indexOf(true, start)
            }

            if (currentHand.endPos === leavingPlayerIndex) {
                playersInHand = Array.from(game.players.map((player, idx) => player ? player.inHand : false))
                start = (leavingPlayerIndex === 0) ? game.players.length - 1 : leavingPlayerIndex - 1
                const nextEndPos = playersInHand.lastIndexOf(true, start) 
                nextEndPos < 0 ? currentHand.endPos = game.players.length + nextEndPos :  currentHand.endPos = nextEndPos
            }
        }

        game.markModified('players')
        game.markModified('hands')
        await game.save()
    })()
}
