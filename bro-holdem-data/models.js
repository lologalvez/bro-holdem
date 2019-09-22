const mongoose = require('mongoose')
const { card, game, hand, action, player, user } = require('./schemas')

module.exports = {
    Card: mongoose.model('Card', card),
    Game: mongoose.model('Game', game),
    Hand: mongoose.model('Hand', hand),
    Action: mongoose.model('Action', action),
    Player: mongoose.model('Player', player),
    User: mongoose.model('User', user)
}
