const { validate } = require('bro-holdem-utils')
const { models: { Action } } = require('bro-holdem-data')
const gameCheck = require('../../game/game-check')

/**
* 
* @param {*} gameId 
* @param {*} playerId 
* @param {*} actionType 
* @param {*} actionAmount 
* 
* @returns {Promise}
*/

module.exports = function (gameId, userId) {

    validate.objectId(gameId, 'Game ID')
    validate.objectId(userId, 'User ID')

    return (async () => {
        /* Folding is throwing cards, sit out from current hand */

        // Basic game checks
        const { player, game, currentHand } = await gameCheck(gameId, userId)

        // Update player
        player.inHand = false
        player.cards = []

        // Register action
        const action = new Action({
            type: 'fold',
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

        await Promise.all([action.save(), game.save()])
        return

    })()
}
