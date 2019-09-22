const mongoose = require('mongoose')

let connection

module.exports = {
    connect(url) {
        return connection ? connection : connection = mongoose.connect(url, { useNewUrlParser: true })
    },

    disconnect() {
        connection = undefined

        return mongoose.disconnect()
    }
}