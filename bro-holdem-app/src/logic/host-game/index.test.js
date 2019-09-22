require('dotenv').config()
import logic from '..'
import { database, models } from 'bro-holdem-data'
const REACT_APP_DB_URL_TEST = process.env.REACT_APP_DB_URL_TEST
const REACT_APP_JWT_SECRET_TEST = process.env.REACT_APP_JWT_SECRET_TEST
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const { Game, User } = models

const { random } = Math

describe.only('logic - host game', () => {
    beforeAll(() => database.connect(REACT_APP_DB_URL_TEST))

    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId
    let username, email, password, repassword
    let token

    beforeEach(async () => {
        name = `gameName - ${random()} `
        maxPlayers = `${(random() * 9).toFixed()}`
        initialStack = `${(random() * 1500).toFixed()}`
        initialBB = `${(random() * (50 - 25) + 25).toFixed()}`
        initialSB = `${(random() * (25 - 10) + 10).toFixed()}`
        blindsIncrease = `${(random() * (10 - 2) + 2).toFixed()}`

        username = `username - ${random()} `
        email = `email-${random()}@email.com`
        password = `pass-${random()} `
        repassword = password

        await User.deleteMany()
        const hash = await bcrypt.hash(password, 10)
        const user = new User({ username, email, password: hash })
        hostId = user.id
        await user.save()

        // Emulate authentication and generate token
        token = jwt.sign({ sub: hostId }, REACT_APP_JWT_SECRET_TEST)
        logic.__token__ = token
    })

    it('should succeed on correct data', async () => {

        const response = await logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease)
        expect(response).toBeDefined()
        const game = await Game.findById(response)
        expect(game.id).toBe(response)
        expect(game.maxPlayers).toBe(Number(maxPlayers))
        expect(game.initialStack).toBe(Number(initialStack))
        expect(game.initialBB).toBe(Number(initialBB))
        expect(game.initialSB).toBe(Number(initialSB))
        expect(game.blindsIncrease).toBe(Number(blindsIncrease))
        expect(String(game.host)).toBe(hostId)
    })

    /* Name */
    it('should fail on empty name', () =>
        expect(() =>
            logic.hostGame('', maxPlayers, initialStack, initialBB, initialSB, blindsIncrease)
        ).toThrow('name is empty or blank')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.hostGame(undefined, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease)
        ).toThrow('name with value undefined is not a string')
    )

    it('should fail on wrong data type for name', () =>
        expect(() =>
            logic.hostGame(123, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease)
        ).toThrow('name with value 123 is not a string')
    )

    /* Max Players */
    it('should fail on empty max players', () =>
        expect(() =>
            logic.hostGame(name, '', initialStack, initialBB, initialSB, blindsIncrease)
        ).toThrow('maxPlayers is empty or blank')
    )

    it('should fail on undefined max players', () =>
        expect(() =>
            logic.hostGame(name, undefined, initialStack, initialBB, initialSB, blindsIncrease)
        ).toThrow('maxPlayers with value undefined is not a string')
    )

    /* Initial Stack */
    it('should fail on empty initial stack', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, '', initialBB, initialSB, blindsIncrease)
        ).toThrow('initialStack is empty or blank')
    )

    it('should fail on undefined initial stack', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, undefined, initialBB, initialSB, blindsIncrease)
        ).toThrow('initialStack with value undefined is not a string')
    )

    /* Initial BB */
    it('should fail on empty initial BB', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, '', initialSB, blindsIncrease)
        ).toThrow('initialBB is empty or blank')
    )

    it('should fail on undefined initial BB', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, undefined, initialSB, blindsIncrease)
        ).toThrow('initialBB with value undefined is not a string')
    )

    /* Initial SB */
    it('should fail on empty initial SB', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, '', blindsIncrease)
        ).toThrow('initialSB is empty or blank')
    )

    it('should fail on undefined initial SB', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, undefined, blindsIncrease)
        ).toThrow('initialSB with value undefined is not a string')
    )


    /* Initial SB */
    it('should fail on empty blinds increase', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, '')
        ).toThrow('blindsIncrease is empty or blank')
    )

    it('should fail on undefined blinds increase', () =>
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, undefined)
        ).toThrow('blindsIncrease with value undefined is not a string')
    )

    afterAll(() => database.disconnect())
})