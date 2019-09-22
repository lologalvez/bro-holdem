const { validate } = require('bro-holdem-utils')
const { models: { Game } } = require('bro-holdem-data')
const { Hand } = require('pokersolver')

/**
* 
* @param {*} gameId
* @returns {Promise}
*
*/

module.exports = function (gameId) {

    validate.objectId(gameId, 'Game ID')

    return (async () => {

        // Find game
        const game = await Game.findById(gameId)
        if (!game) throw Error('Game does not exist.')

        const currentHand = game.hands[game.hands.length - 1]
        if (!currentHand) throw Error('There are no hands dealt yet.')

        debugger
        // Only one player remaining (the rest folded hand)
        const playersInHand = game.players.filter(player => player.inHand)
        if (playersInHand.length === 1) {
            const winnerIndex = game.players.findIndex(player => player.inHand)
            game.players[winnerIndex].currentStack += currentHand.pot
            await game.save()
            return
        }

        // 1+ player remaining (got to river)
        debugger
        const handsMixed = playersInHand.map((player) => {
            if (player.inHand)
                return ({ playerIndex: player.position, cards: Array(...player.cards.map(card => card.ref), ...currentHand.tableCards.map(card => card.ref)) })
        })

        const solvedHands = handsMixed.map(hand => Hand.solve(hand.cards))
        const winningHands = Hand.winners(solvedHands)

        const winningHandsArrays = winningHands.map(hand => hand.cardPool.map(card => card.value + card.suit))

        let potWinners = []
        handsMixed.forEach(playerHand =>
            winningHandsArrays.forEach(handArray => {
                if (playerHand.cards.sort().toString() === handArray.sort().toString())
                    potWinners.push(playerHand.playerIndex)
            })
        )

        potWinners.forEach(index => {
            const potSlice = currentHand.pot / potWinners.length
            game.players[index].currentStack += potSlice
        })

        await game.save()

    })()
}

