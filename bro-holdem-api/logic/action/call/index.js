const { validate } = require('bro-holdem-utils')
const { models: { Action } } = require('bro-holdem-data')
const gameCheck = require('../../game/game-check')

/**
* 
* @param {*} gameId 
* @param {*} playerId 
* 
* @returns {Promise}
*/

module.exports = function (gameId, userId) {

    validate.objectId(gameId, 'Game ID')
    validate.objectId(userId, 'User ID')

    return (async () => {

        // Basic game checks
        const { player, game, currentHand } = await gameCheck(gameId, userId)

        // Find highest bet in hand
        const highestBet = Math.max.apply(Math, game.players.map(key => key.betAmount))

        // Amount to be called
        const callAmount = highestBet - player.betAmount

        // Update player stack
        player.currentStack -= callAmount
        player.betAmount = highestBet

        // Update hand's pot
        currentHand.pot += callAmount

        // Register action
        const action = new Action({
            type: 'call',
            playerStack: player.currentStack,
            playerPos: player.position,
            playerCards: player.cards,
            betAmount: player.betAmount,
            handPot: currentHand.pot
        })
        action.user = player.user
        action.player = player.id
        action.game = game.id
        action.hand = currentHand.id

        await Promise.all([game.save(), action.save()])
        return

    })()
}
