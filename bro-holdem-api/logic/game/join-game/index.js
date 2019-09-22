const { validate } = require('bro-holdem-utils')
const { models: { User, Player, Game } } = require('bro-holdem-data')

/**
 * 
 * @param {*} gameId 
 * 
 * @returns {Promise}
 */

module.exports = function (gameId, userId) {

    validate.objectId(gameId, 'Game ID')
    validate.objectId(userId, 'User ID')

    return (async () => {

        // Check if user exists
        const user = await User.findById(userId)
        if (!user) throw Error(`User with id ${userId} does not exist.`)

        // Retrieve game using access token
        const game = await Game.findById(gameId)
        if (!game) throw Error(`Game with id ${gameId} does not exist.`)

        // Check if table is full
        if (game.players.length === game.maxPlayers) throw Error(`Game room is full.`)

        // Check if game's already started
        if (game.status === 'playing') throw Error(`Game's already started.`)
        if (game.status === 'close') throw Error(`Game's already finished.`)

        // Create new instance of player
        const newPlayer = new Player({
            position: game.players.length,
            currentStack: game.initialStack,
            cards: [],
            inHand: false,
            betAmount: 0
        })
        newPlayer.user = userId

        // Push user as game participant 
        game.players.push(newPlayer)

        await game.save()
        return { userName: user.username, gameName: game.name }
    })()
}