const { validate } = require('bro-holdem-utils')
const { models: { User } } = require('bro-holdem-data')

/**
 * 
 * @param {*} id
 * @param {*} fieldsToUpdate 
 * 
* @returns {Promise}
*/

module.exports = function (id, fieldsToUpdate) {
    validate.string(id, 'id')

    return (async () => {

        const user = await User.updateOne({ _id: id }, { $set: fieldsToUpdate })
        if (!user) throw Error(`User with id ${id} does not exist.`)

    })()
}