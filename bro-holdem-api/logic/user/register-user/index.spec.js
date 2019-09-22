require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../../../logic')
const { models: { User } } = require('bro-holdem-data')
const bcrypt = require('bcryptjs')

const { env: { DB_URL_TEST } } = process

describe('logic - register user', () => {

    before(() => {
        database.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
    })

    let name, surname, email, password

    beforeEach(() => {

        username = `username-${Math.random()}`
        email = `email-${Math.random()}@email.com`
        password = `password-${Math.random()}`
    })

    it('should succeed on correct data', async () => {
        const result = await logic.registerUser(username, email, password)
        expect(result).to.exist
        const user = await User.findById(result)
        expect(user).to.exist
        expect(user.username).to.equal(username)
        expect(user.email).to.equal(email)
        const match = await bcrypt.compare(password, user.password)
        expect(match).to.be.true
    })

    it('should fail if the user already exists', async () => {

        await User.create({ username, email, password })

        try {
            await logic.registerUser(username, email, password)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal(`User with e-mail ${email} already exists.`)
        }
    })


    it('should fail if the username is already taken', async () => {

        await User.create({ username, email, password })

        try {
            await logic.registerUser(username, 'another-email@mail.com', password)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal(`Username is already taken.`)
        }
    })

    /* Name */
    it('should fail on empty name', () =>
        expect(() =>
            logic.registerUser('', email, password)
        ).to.throw('username is empty or blank')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.registerUser(undefined, email, password)
        ).to.throw(`username with value undefined is not a string`)
    )

    it('should fail on wrong data type for name', () =>
        expect(() =>
            logic.registerUser(123, surname, email, password)
        ).to.throw(`username with value 123 is not a string`)
    )

    /* Email */
    it('should fail on empty email', () =>
        expect(() =>
            logic.registerUser(username, '', password)
        ).to.throw('email is empty or blank')
    )

    it('should fail on undefined surname', () =>
        expect(() =>
            logic.registerUser(username, undefined, password)
        ).to.throw(`email with value undefined is not a string`)
    )

    it('should fail on wrong data type for email', () =>
        expect(() =>
            logic.registerUser(username, 123, password)
        ).to.throw(`email with value 123 is not a string`)
    )

    it('should fail on wrong email format', () =>
        expect(() =>
            logic.registerUser(username, 'a@a', password)
        ).to.throw(`email with value a@a is not a valid e-mail`)
    )

    /* Password */
    it('should fail on empty password', () =>
        expect(() =>
            logic.registerUser(username, email, '')
        ).to.throw('password is empty or blank')
    )

    it('should fail on undefined password', () =>
        expect(() =>
            logic.registerUser(username, email, undefined)
        ).to.throw(`password with value undefined is not a string`)
    )

    it('should fail on wrong data type for password', () =>
        expect(() =>
            logic.registerUser(username, email, 123)
        ).to.throw(`password with value 123 is not a string`)
    )

    after(() => database.disconnect())
})