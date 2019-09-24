const { validate } = require('bro-holdem-utils')
const { models: { User } } = require('bro-holdem-data')
/**

/**
* Retrieve user object sanitized
* @param {ObjectId} id
* @return {user object}
*/

module.exports = function (id) {

    validate.string(id, 'id')

    return (async () => {
        const user = await User.findOne({ _id: id }, { _id: 0, password: 0, __v: 0 }).lean()
        if (!user) throw Error(`User with id ${id} does not exist.`)
        user.id = id
        return user
    })()
}