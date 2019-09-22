const { Schema, ObjectId } = require('mongoose')

module.exports = new Schema({
    position: {
        type: Number,
        required: true
    },

    currentStack: {
        type: Number,
        required: true
    },
    cards: {
        type: Array,
        required: true
    },

    inHand: {
        type: Boolean,
        required: true
    },

    betAmount: {
        type: Number,
        required: true,
        default: 0
    },

    user: { type: ObjectId, ref: 'User' },
})
