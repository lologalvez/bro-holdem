const { validate } = require('bro-holdem-utils')
const { models: { User } } = require('bro-holdem-data')
const bcrypt = require('bcryptjs')

/**
 * Unregisters a user by their email
 * 
 * @param {string} id 
 * @param {string} email
 * 
 * 
 * @returns {Promise}
*/
module.exports = function (id, email, password) {

    validate.string(id, 'id')
    validate.string(email, 'email')
    validate.email(email, 'email')
    validate.string(password, 'password')

    return (async () => {

        const user = await User.findOne({ email })
        if (!user) throw Error('Wrong credentials.')

        const match = await bcrypt.compare(password, user.password)
        if (!match) throw Error('Wrong credentials')

        const userDeleted = await User.deleteOne({ email })
        if (userDeleted.deletedCount === 0) throw Error(`There was an error unregistering the user`)


    })()

}