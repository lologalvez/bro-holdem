import logic from '..'
import { database, models } from 'bro-holdem-data'
import jwt from 'jsonwebtoken'

const { User } = models

const REACT_APP_DB_URL_TEST = process.env.REACT_APP_DB_URL_TEST
const REACT_APP_JWT_SECRET_TEST = process.env.REACT_APP_JWT_SECRET_TEST

describe('logic - retrieve user', () => {
    beforeAll(() => database.connect(REACT_APP_DB_URL_TEST))

    let username, email, password, userId

    beforeEach(async () => {

        username = `username-${Math.random()}`
        email = `email-${Math.random()}@domain.com`
        password = `password-${Math.random()}`

        await User.deleteMany()

        const user = new User({ username, email, password })

        userId = user.id

        const token = jwt.sign({ sub: userId }, REACT_APP_JWT_SECRET_TEST)

        logic.__token__ = token

        await user.save()
    })

    it('should succeed on correct data', async () => {
        const user = await logic.retrieveUser()
        expect(user).toBeDefined()
        expect(user.id).toBe(userId)
        expect(user._id).toBeUndefined()
        expect(user.username).toBe(username)
        expect(user.email).toBe(email)
        expect(user.password).toBeUndefined()
    })


    it('should fail on incorrect token', async () => {
        try {
            await logic.retrieveUser()
        } catch (error) {
            expect(error).toBeDefined()
        }
    })

    afterAll(() => database.disconnect())

})
