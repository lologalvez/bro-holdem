require('dotenv').config()

const { expect } = require('chai')
const logic = require('../../../logic')
const { database, models: { User } } = require('bro-holdem-data')

const { env: { DB_URL_TEST } } = process

describe('logic', () => {

    before(() => database.connect(DB_URL_TEST))


    describe('retrieve user', () => {
        let username, email, password, id

        beforeEach(() => {
            username = `username-${Math.random()}`
            email = `email-${Math.random()}@domain.com`
            password = `password-${Math.random()}`

            return (async () => {
                await User.deleteMany()
                const user = await User.create({ username, email, password })
                id = user.id
            })()
        })

        it('should succeed on correct data', async () => {
            const user = await logic.retrieveUser(id)
            expect(user).to.exist
            expect(user.id).to.equal(id)
            expect(user._id).not.to.exist
            expect(user.username).to.equal(username)
            expect(user.email).to.equal(email)
            expect(user.password).not.to.exist
        })

        it('should fail on incorrect user id', async () => {
            id = '5d772fb62bb54120d08d7a7b'
            try {
                await logic.retrieveUser(id)
                throw Error('should not reach this point')
            }
            catch ({ message }) {
                expect(message).to.equal(`User with id ${id} does not exist.`)
            }

        })


        it('should fail on empty id', () => {
            expect(() =>
                logic.retrieveUser('')
            ).to.throw(Error, 'id is empty or blank')
        })

        it('should fail on emtpy password', () => {
            expect(() =>
                logic.retrieveUser(undefined)
            ).to.throw(Error, 'id with value undefined is not a string')
        })

        it('should fail on non-valid email', () => {
            expect(() =>
                logic.retrieveUser(123)
            ).to.throw(Error, 'id with value 123 is not a string')
        })
    })

    after(() => database.disconnect())

})