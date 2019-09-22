const { validate } = require('bro-holdem-utils')
const { models: { Game, User } } = require('bro-holdem-data')

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
        const game = await Game.findOne({ _id: gameId }, { _id: 0, __v: 0 }).populate('players.user').lean()
        if (!game) throw Error('Game does not exist.')
        game.id = gameId
        game.players.forEach(player => {
            if (player) {
                player.id = String(player._id)
                player.user.id = String(player.user._id)
                delete player._id
            }
        })
        game.hands.forEach(hand => {
            if (hand) {
                hand.id = String(hand._id)
                delete hand._id
            }
        })
        return game
    })()
}
