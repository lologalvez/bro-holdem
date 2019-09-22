require('dotenv').config()
import registerUser from '.'
import { database, models } from 'bro-holdem-data'
const REACT_APP_DB_URL_TEST = process.env.REACT_APP_DB_URL_TEST
const bcrypt = require('bcryptjs')

const { User } = models

const { random } = Math

describe('logic - register user', () => {
    beforeAll(() => database.connect(REACT_APP_DB_URL_TEST))

    let username, email, password, repassword

    beforeEach(() => {
        username = `username-${random()}`
        email = `email-${random()}@email.com`
        password = `pass-${random()}`
        repassword = password

        return (async () => await User.deleteMany())()
    })

    it('should succeed on correct data', async () => {

        const response = await registerUser(username, email, password, repassword)
        expect(response).toBeDefined()
        const user = await User.findById(response.userId)
        expect(user.username).toBe(username)
        expect(user.email).toBe(email)
        const match = await bcrypt.compare(password, user.password)
        expect(match).toBeTruthy()

    })

    it('should fail if user with same username already exists', async () => {

        const newEmail = 'new@email.com'
        await User.create({ username, email: newEmail, password })

        try {
            await registerUser(username, email, password, repassword)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('Username is already taken.')
        }
    })

    it('should fail if user with same email already exists', async () => {

        const newUsername = 'newUsername'
        await User.create({ username: newUsername, email, password })

        try {
            await registerUser('differentUsername', email, password, repassword)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe(`User with e-mail ${email} already exists.`)
        }
    })

    /* Username  */
    it('should fail on empty username', () =>
        expect(() =>
            registerUser('', email, password, repassword)
        ).toThrow('username is empty or blank')
    )

    it('should fail on undefined username', () =>
        expect(() =>
            registerUser(undefined, email, password, repassword)
        ).toThrow(`username with value undefined is not a string`)
    )

    it('should fail on wrong data type for username', () =>
        expect(() =>
            registerUser(123, email, password, repassword)
        ).toThrow(`username with value 123 is not a string`)
    )

    /* Email */
    it('should fail on empty email', () =>
        expect(() =>
            registerUser(username, '', password, repassword)
        ).toThrow('email is empty or blank')
    )

    it('should fail on undefined username', () =>
        expect(() =>
            registerUser(username, undefined, password, repassword)
        ).toThrow(`email with value undefined is not a string`)
    )

    it('should fail on wrong data type for email', () =>
        expect(() =>
            registerUser(username, 123, password, repassword)
        ).toThrow(`email with value 123 is not a string`)
    )

    it('should fail on wrong email format', () =>
        expect(() =>
            registerUser(username, 'a@a', password, repassword)
        ).toThrow(`email with value a@a is not a valid e-mail`)
    )

    /* Password */
    it('should fail on password and repassword mismatch', () =>
        expect(() =>
            registerUser(username, email, 'aaa', '')
        ).toThrow('Passwords do not match')
    )
    it('should fail on empty password', () =>
        expect(() =>
            registerUser(username, email, '', '')
        ).toThrow('password is empty or blank')
    )

    it('should fail on undefined password', () =>
        expect(() =>
            registerUser(username, email, undefined, undefined)
        ).toThrow(`password with value undefined is not a string`)
    )

    it('should fail on wrong data type for password', () =>
        expect(() =>
            registerUser(username, email, 123, 123)
        ).toThrow(`password with value 123 is not a string`)
    )

    afterAll(() => database.disconnect())
})