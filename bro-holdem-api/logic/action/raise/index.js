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

module.exports = function (gameId, userId, raiseTo) {
    /* Raising is betting over the highest bet on the table */

    validate.objectId(gameId, 'Game ID')
    validate.objectId(userId, 'User ID')
    validate.number(raiseTo, 'Raise')

    return (async () => {

        let start, newEndPos

        // Basic game checks
        const { player, game, currentHand } = await gameCheck(gameId, userId)

        // Find highest bet in hand
        const highestBet = Math.max.apply(Math, game.players.map(key => key.betAmount))

        //if (highestBet >= raiseTo) throw Error('Raise bet cannot be less than highest bet on table.')

        // Amount to be called
        const raiseAmount = raiseTo + player.betAmount

        // Update player stack
        player.currentStack -= raiseTo
        player.betAmount = raiseAmount

        // Update hand's pot and end position
        currentHand.pot += raiseTo

        // Update end position counting counter-clockwise 
        player.position - 1 < 0 ? start = game.players.length - 1 : start = player.position - 1
        newEndPos = Array.from(game.players.map(player => player ? player.inHand : false)).lastIndexOf(true, start)
        newEndPos < 0 ? currentHand.endPos = game.players.length + newEndPos : currentHand.endPos = newEndPos

        // Register action
        const action = new Action({
            type: 'raise',
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
