const { models: { Game } } = require('bro-holdem-data')

async function gameCheck(gameId, userId) {

    // Check if game exists
    const game = await Game.findById(gameId)
    if (!game) throw Error('Game does not exist.')

    // Check if player is in game
    if (!game.players.length) throw Error('There are no players in this game.')
    const player = game.players.find(player => String(player.user) === userId)
    if (!player) throw Error('Player does not belong to this game.')

    // Check if is players' turn
    if (!game.hands.length) throw Error('There are no active hands in this game.')
    const currentHand = game.hands[game.hands.length - 1]
    if (player.position !== currentHand.turnPos) throw Error('Not player\'s turn')

    // Check if player is playing hand
    if (!player.inHand) throw Error('Player has already folded this hand.')

    return { player, game, currentHand }

}

module.exports = gameCheck