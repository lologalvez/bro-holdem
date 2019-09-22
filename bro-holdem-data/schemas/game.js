const mongoose = require('mongoose')
const { Schema, ObjectId } = mongoose
const playerSchema = require('./player')
const handSchema = require('./hand')

module.exports = new Schema({
    name: {
        type: String,
        required: true
    },

    maxPlayers: {
        type: Number,
        required: true
    },

    initialStack: {
        type: Number,
        required: true
    },

    initialBB: {
        type: Number,
        required: true,
    },

    initialSB: {
        type: Number,
        required: true
    },

    blindsIncrease: {
        type: Number,
        required: true,
        default: false
    },

    currentBB: {
        type: Number,
        default: 0
    },

    currentSB: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        required: true,
        enum: ['playing', 'open', 'closed'],
        default: 'open'
    },

    host: { type: ObjectId, ref: 'User' },
    players: [playerSchema],
    hands: [handSchema]
})
