require('dotenv').config()
import logic from '..'
import { database, models } from 'bro-holdem-data'
const REACT_APP_DB_URL_TEST = process.env.REACT_APP_DB_URL_TEST
const bcrypt = require('bcryptjs')

const { User } = models

const { random } = Math

describe('logic - authenticate user', () => {
    beforeAll(() => database.connect(REACT_APP_DB_URL_TEST))

    let username, email, password, repassword

    beforeEach(() => {
        username = `username-${random()}`
        email = `email-${random()}@email.com`
        password = `pass-${random()}`
        repassword = password

        return (async () => {
            const hash = await bcrypt.hash(password, 10)
            await User.create({ username, email, password: hash })
        })()
    })

    it('should succeed on correct data', async () => {
        const response = await logic.authenticateUser(email, password)
        expect(response).toBeUndefined()
        expect(logic.__token__).toBeDefined()
    })

    it('should fail if on wrong email', async () => {

        const wrongEmail = 'new@email.com'

        try {
            await logic.authenticateUser(wrongEmail, password)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('Wrong credentials')
        }
    })

    it('should fail on wrong password ', async () => {
        const wrongPassword = 'blablabla'
        try {
            await logic.authenticateUser(email, wrongPassword)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('Wrong credentials')
        }
    })

    /* Email */
    it('should fail on empty email', () =>
        expect(() =>
            logic.authenticateUser('', password)
        ).toThrow('email is empty or blank')
    )

    it('should fail on undefined username', () =>
        expect(() =>
            logic.authenticateUser(undefined, password)
        ).toThrow(`email with value undefined is not a string`)
    )

    it('should fail on wrong data type for email', () =>
        expect(() =>
            logic.authenticateUser(123, password)
        ).toThrow(`email with value 123 is not a string`)
    )

    it('should fail on wrong email format', () =>
        expect(() =>
            logic.authenticateUser('a@a', password)
        ).toThrow(`email with value a@a is not a valid e-mail`)
    )

    /* Password */
    it('should fail on password and repassword mismatch', () =>
        expect(() =>
            logic.authenticateUser(email, '')
        ).toThrow('password is empty or blank')
    )
    it('should fail on empty password', () =>
        expect(() =>
            logic.authenticateUser(email, undefined)
        ).toThrow('password with value undefined is not a string')
    )

    it('should fail on undefined password', () =>
        expect(() =>
            logic.authenticateUser(email, 123)
        ).toThrow(`password with value 123 is not a string`)
    )

    afterAll(() => database.disconnect())
})