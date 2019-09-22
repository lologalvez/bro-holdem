const { validate } = require('bro-holdem-utils')
const { models: { Game } } = require('bro-holdem-data')
const cardDealing = require('../card-dealing')
const resolveHand = require('../resolve-hand')

/**
* 
* @param {*} gameId
* @returns {Promise}
*
*/

module.exports = function (gameId) {
    // Checks after each player action
    // If only one player remaining: resolve hand, deal new one
    // If 1+ player remaining. Check if turn is over (turnPos === endPos)
    // If not over, resolve turn

    validate.objectId(gameId, 'Game ID')

    return (async () => {

        let newTurnPos, newEndPos, remainingPlayers
        // Find game
        const game = await Game.findById(gameId)
        if (!game) throw Error('Game does not exist.')

        if (game.players.length === 1) throw Error('The game is over.')
        const currentHand = game.hands[game.hands.length - 1]
        if (!currentHand) throw Error('There are no hands dealt yet.')

        // Check remaining players
        remainingPlayers = game.players.filter(player => player.inHand)
        
        if (remainingPlayers.length > 1) {

            // TURN UPDATE: Check if there are players left to speak
            if (currentHand.turnPos !== currentHand.endPos) {
                const playersStatus = Array.from(game.players.map(player => player ? player.inHand : false))
                currentHand.turnPos = playersStatus.indexOf(true, currentHand.turnPos === game.players.length - 1 ? 0 : currentHand.turnPos + 1)

                await game.save()
                return { message: 'Turn updated successfully', stage: 'Turn' }
            }

            // ROUND END
            if (currentHand.turnPos === currentHand.endPos) {

                // If got to river, resolve hand, else, end resolve betting round
                if (currentHand.round === 3) {
                    try {
                        resolveHand(gameId)
                        return { message: 'Hand resolved successfully', stage: 'Hand' }
                    } catch (error) {
                        throw Error('Hand could not be resolved')
                    }
                }

                // Didn't go to river yet, but hand must be resolved since only one player remaining
                const playersRemaining = game.players.filter(player => player.inHand)
                if (playersRemaining < 2) {
                    try {
                        resolveHand(gameId)
                        return { message: 'Hand resolved successfully', stage: 'Hand' }
                    } catch (error) {
                        throw Error('Hand could not be resolved')
                    }
                }   

                // Check if all players inHand have the highest bet on table
                const highestBet = Math.max.apply(Math, game.players.map(key => key.betAmount))

                const betCheck = game.players.every(player => {
                    if (player.inHand)
                        return player.betAmount === highestBet
                    return true
                })

                if (!betCheck) throw Error('There are players that have not called the highest bet')

                // Update turn position starting from dealer + 1 (first inHand)
                newTurnPos =  Array.from(game.players.map(player => player ? player.inHand : false)).indexOf(true, currentHand.dealerPos + 1)
                newTurnPos < 0 ? currentHand.turnPos = 0 : (newTurnPos > game.players.length - 1 ? currentHand.turnPos = game.players.length - 1 : currentHand.turnPos = newTurnPos)

                // Update end position counting counter-clockwise 
                newEndPos = Array.from(game.players.map(player => player ? player.inHand : false)).lastIndexOf(true, currentHand.dealerPos)
                newEndPos < 0 ? currentHand.endPos = game.players.length + newEndPos : currentHand.endPos = newEndPos 

                // Reset bet amount of each player to zero
                game.players.forEach(player => player.betAmount = 0)

                // Update round
                currentHand.round += 1

                // Deal new card only if current round is 2 or 3
                if ([2, 3].includes(currentHand.round))
                    await cardDealing(currentHand.tableCards, 1, currentHand.usedCards)

                await game.save()

                return { message: 'Round resolved successfully', stage: 'Round' }

            }
        } else {
            try {
                resolveHand(gameId)
                return { message: 'Hand resolved successfully', stage: 'Hand' }
            } catch (error) {
                throw Error('Hand could not be resolved')
            }
        }

    })()
}

