require('dotenv').config()
const { expect } = require('chai')
const logic = require('../../../logic')
const { database, models: { User } } = require('bro-holdem-data')
const bcrypt = require('bcryptjs')

const { env: { DB_URL_TEST } } = process

describe('logic - unregister user', () => {


    before(() => database.connect(DB_URL_TEST))

    let username, email, password, id

    beforeEach(async () => {
        username = `surname-${Math.random()}`
        email = `email-${Math.random()}@domain.com`
        password = `password-${Math.random()}`
        await User.deleteMany()
        const users = await User.create({ username, email, password: await bcrypt.hash(password, 10) })
        id = users.id
    })
    it('should succeed on correct data', async () => {

        const result = await logic.unregisterUser(id, email, password)
        expect(result).not.to.exist
        const userFind = await User.findById(id)
        expect(userFind).not.to.exist

    })


    it('should fail on unexisting user', async () => {
        email = "fake@fake.com"
        try {
            await logic.unregisterUser(id, email, password)
            throw Error('should not reach this point')
        }
        catch ({ message }) {
            expect(message).to.equal('Wrong credentials.')
        }

    })


    it('should fail on existing user, but wrong password', async () => {
        password = 'wrong password'
        await bcrypt.hash(password, 10)
        try {
            await logic.unregisterUser(id, email, password)
            throw Error('should not reach this point')
        }
        catch ({ message }) {
            expect(message).to.equal('Wrong credentials')
        }

    })

    it('should fail on empty id', () => {
        expect(() =>
            logic.unregisterUser('', email, password)
        ).to.throw(Error, 'id is empty or blank')
    })

    it('should fail on undefined id', () => {
        expect(() =>
            logic.unregisterUser(undefined, email, password)
        ).to.throw(Error, 'id with value undefined is not a string')
    })

    it('should fail on non-valid id', () => {
        expect(() =>
            logic.unregisterUser(123, email, password)
        ).to.throw(Error, 'id with value 123 is not a string')
    })




    it('should fail on empty email', () => {
        expect(() =>
            logic.unregisterUser(id, '', password)
        ).to.throw(Error, 'email is empty or blank')
    })

    it('should fail on undefined email', () => {
        expect(() =>
            logic.unregisterUser(id, undefined, password)
        ).to.throw(Error, 'email with value undefined is not a string')
    })

    it('should fail on non-valid email', () => {
        expect(() =>
            logic.unregisterUser(id, 123, password)
        ).to.throw(Error, 'email with value 123 is not a string')
    })



    it('should fail on empty password', () => {
        expect(() =>
            logic.unregisterUser(id, email, '')
        ).to.throw(Error, 'password is empty or blank')
    })

    it('should fail on undefined password', () => {
        expect(() =>
            logic.unregisterUser(id, undefined, '')
        ).to.throw(Error, 'email with value undefined is not a string')
    })

    it('should fail on non-valid password', () => {
        expect(() =>
            logic.unregisterUser(id, 123, password)
        ).to.throw(Error, 'email with value 123 is not a string')
    })

    after(() => database.disconnect())
})