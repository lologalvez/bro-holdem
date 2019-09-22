require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../../../logic')
const { models: { User } } = require('bro-holdem-data')
const bcrypt = require('bcryptjs')

const { env: { DB_URL_TEST } } = process

describe('logic - authenticate user', () => {

    before(() => {
        database.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
    })

    let username, email, password, id

    beforeEach(() => {

        username = `username-${Math.random()}`
        email = `email-${Math.random()}@mail.com`
        password = `name-${Math.random()}`


        return (async () => {
            await User.deleteMany()
            const user = await User.create({ username, email, password: await bcrypt.hash(password, 10) })
            id = user.id
        })()
    })

    it('should authenticate on correct data', async () => {
        const result = await logic.authenticateUser(email, password)
        expect(result).to.exist
        expect(result).to.be.a('string')
        expect(result).to.equal(id)
    })

    it('should fail on incorrect data', async () => {
        let password = "fail"

        try {
            await logic.authenticateUser(email, password)
        } catch (error) {
            expect(error).to.exist
        }
    })

    it('should fail on empty email', () => {
        expect(() =>
            logic.authenticateUser('', password)
        ).to.throw(Error, 'email is empty or blank')
    })

    it('should fail on emtpy password', () => {
        expect(() =>
            logic.authenticateUser(email, '')
        ).to.throw(Error, 'password is empty or blank')
    })

    it('should fail on non-valid email', () => {
        expect(() =>
            logic.authenticateUser('asdf#adsf.com', password)
        ).to.throw(Error, 'email with value asdf#adsf.com is not a valid e-mail')
    })

    it('should fail on non-string email', () => {
        expect(() =>
            logic.authenticateUser(undefined, password)
        ).to.throw(Error, 'email with value undefined is not a string')
    })

    it('should fail on non-string password', () => {
        expect(() =>
            logic.authenticateUser(email, undefined)
        ).to.throw(Error, 'password with value undefined is not a string')
    })

    after(() => database.disconnect())
})