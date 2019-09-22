const { validate } = require('bro-holdem-utils')
const { models: { Game, Player } } = require('bro-holdem-data')

/**
* 
* @param {*} name 
* @param {*} maxPlayers 
* @param {*} initialStack 
* @param {*} initialBB 
* @param {*} initialSB 
* @param {*} blindsIncrease 
* @param {*} hostId 
* 
* @returns {Promise}
*/

module.exports = function (name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId) {

    validate.string(name, 'name')
    validate.number(maxPlayers, 'maxPlayers')
    validate.number(initialStack, 'initialStack')
    validate.number(initialBB, 'initialBB')
    validate.number(initialSB, 'initialSB')
    validate.number(blindsIncrease, 'blindsIncrease')
    validate.objectId(hostId, 'host ID')

    return (async () => {
        const game = await Game.findOne({ name })
        if (game) throw Error('Game already exists.')

        // Create game
        const newGame = new Game({ name, maxPlayers, initialStack, initialBB, initialSB, currentBB: initialBB, currentSB: initialSB, blindsIncrease })
        const gameId = newGame.id
        newGame.host = hostId

        // Create new instance of player
        const newPlayer = new Player({
            position: newGame.players.length,
            currentStack: newGame.initialStack,
            cards: [],
            inHand: false,
            betAmount: 0
        })
        newPlayer.user = hostId

        // Add player to game
        newGame.players.push(newPlayer)

        await newGame.save()
        return gameId
    })()
}
