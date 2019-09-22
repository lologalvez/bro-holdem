const { validate } = require('bro-holdem-utils')
const { models: { Hand, Game } } = require('bro-holdem-data')
const cardDealing = require('../../game/card-dealing')

/**
* 
* @param {*} gameId
* 
* @returns {Promise}
*/

module.exports = function (gameId) {

    validate.objectId(gameId, 'Game ID')

    return (async () => {
        // Find game
        const game = await Game.findById(gameId)
        if (!game) throw Error('Game does not exist.')

        // Check if there are enough participants to start a game
        if (game.players.length < 2 && game.status !== 'playing') throw Error('Not enough players to start a game.')

        // Check if there are enough participants with cash to deal new hand
        const participantsWithCash = game.players.filter(player => player && player.currentStack > 0)
        if (participantsWithCash.length < 2) throw Error('The game is over, thanks for playing')

        // Change game status
        game.status !== 'playing' ? game.status = 'playing' : {}


        // Deal first hand
        let newHand, nextBB, nextSB, previousHand
        if (!game.hands.length) {
            newHand = new Hand({
                pot: game.currentBB + game.currentSB,
                dealerPos: 0,
                bbPos: 2,
                sbPos: 1,
                turnPos: 3,
                endPos: 2,
                round: 0
            })
        } else {
            previousHand = game.hands[game.hands.length -1]
            const playersInGame = Array.from(game.players.map(player => player ? true : false)) // Array of true false
            const nextDealer = playersInGame.indexOf(true, previousHand.dealerPos === game.players.length - 1 ? 0 : previousHand.dealerPos + 1)
            const nextBB = playersInGame.indexOf(true, previousHand.bbPos === game.players.length - 1 ? 0 : previousHand.bbPos + 1)
            const nextSB = playersInGame.indexOf(true, previousHand.sbPos === game.players.length - 1 ? 0 : previousHand.sbPos + 1)
            const nextTurnPos = playersInGame.indexOf(true, nextBB === game.players.length - 1 ? 0 : nextBB + 1)
           
            newHand = new Hand({
                pot: game.currentBB + game.currentSB,
                dealerPos: nextDealer,
                bbPos: nextBB,
                sbPos: nextSB,
                turnPos: nextTurnPos,
                endPos: nextBB,
                round: 0
            })
        }
        // Deal flop cards
        newHand.tableCards = []
        newHand.usedCards = []
        await cardDealing(newHand.tableCards, 3, newHand.usedCards)

        // Players setup and dealing
        for (const player of game.players) {

             if (player.currentStack > 0 ) {

                // Card Dealing
                player.cards = []
                await cardDealing(player.cards, 2, newHand.usedCards)

                // Status
                player.inHand = true

                // Blinds assignment
                let isBlind, blindAmount, stackLeft
                if (player.position === newHand.bbPos) { isBlind = true; blindAmount = game.currentBB }
                if (player.position === newHand.sbPos) { isBlind = true; blindAmount = game.currentSB }
                if (isBlind) {
                    stackLeft = player.currentStack - blindAmount
                    if (stackLeft < 0) {
                        player.betAmount = player.currentStack
                        player.currentStack = 0
                    } else if (stackLeft > 0) {
                        player.betAmount = blindAmount
                        player.currentStack = stackLeft
                    }
                    isBlind = false
                }
            }
        }

        game.hands.push(newHand)
        await game.save()
        return game.name
    })()
}
