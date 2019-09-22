const { Schema } = require('mongoose')

module.exports = new Schema({

    pot: {
        type: Number,
        required: true
    },

    dealerPos: {
        type: Number,
        required: true
    },

    bbPos: {
        type: Number,
        required: true
    },

    sbPos: {
        type: Number,
        required: true
    },

    turnPos: {
        type: Number,
        required: true
    },

    endPos: {
        type: Number,
        default: 1
    },

    round: {
        type: Number,
        required: true
    },

    usedCards: {
        type: Array,
        default: []
    },

    tableCards: {
        type: Array,
        default: []
    }
})

