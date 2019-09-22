const mongoose = require('mongoose')
const { Schema } = mongoose

module.exports = new Schema({
    suit: {
        type: String,
        required: true
    },

    name: {
        type: String,
        required: true
    },

    ref: {
        type: String,
        required: true
    },

    image: {
        type: String,
        required: true,
    }
})
