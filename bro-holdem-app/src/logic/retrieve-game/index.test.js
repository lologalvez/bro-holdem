require('dotenv').config()
import logic from '..'
import { database, models } from 'bro-holdem-data'
const REACT_APP_DB_URL_TEST = process.env.REACT_APP_DB_URL_TEST
const REACT_APP_JWT_SECRET_TEST = process.env.REACT_APP_JWT_SECRET_TEST
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const { Game, User, Player, Hand, Card, Action } = models

const { random } = Math

describe.only('logic - retrieve game', () => {
    beforeAll(() => database.connect(REACT_APP_DB_URL_TEST))

    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId
    let username, email, password, repassword
    let token, hash, user, users = []
    let gameId

    beforeEach(async () => {
        name = `gameName - ${random()} `
        maxPlayers = `${(random() * 9).toFixed()}`
        initialStack = 1500
        initialBB = 50
        initialSB = 25
        blindsIncrease = `${(random() * (10 - 2) + 2).toFixed()}`

        await User.deleteMany()
        await Game.deleteMany()

        // Create three users
        for (let i = 0; i < 3; i++) {
            username = `username - ${random()} `
            email = `email-${random()}@email.com`
            password = `pass-${random()} `
            repassword = password

            hash = await bcrypt.hash(password, 10)
            user = new User({ username, email, password: hash })
            users[i] = user
            await user.save()
        }

        // Create new game
        const newGame = new Game({ name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease })
        gameId = newGame.id
        newGame.host = users[0].id

        let newPlayer

        // Add only two users to game
        for (let i = 0; i < 2; i++) {
            newPlayer = new Player({
                position: newGame.players.length,
                currentStack: initialStack,
                cards: [],
                inHand: false,
                betAmount: 0
            })
            newPlayer.user = users[i].id
            newGame.players.push(newPlayer)
        }

        // Create token of third user
        token = jwt.sign({ sub: users[2].id }, REACT_APP_JWT_SECRET_TEST)
        logic.__token__ = token

        await newGame.save()
    })

    it('should succeed on correct data (game status open)', async () => {
        const response = await logic.retrieveGame(gameId)
        const retrievedGame = await Game.findById(gameId)
        expect(retrievedGame.name).toBe(name)
        expect(retrievedGame.maxPlayers).toBe(Number(maxPlayers))
        expect(retrievedGame.initialStack).toBe(Number(initialStack))
        expect(retrievedGame.initialBB).toBe(Number(initialBB))
        expect(retrievedGame.initialSB).toBe(Number(initialSB))
        expect(retrievedGame.blindsIncrease).toBe(Number(blindsIncrease))
        expect(retrievedGame.currentBB).toBe(0)
        expect(retrievedGame.currentSB).toBe(0)
        expect(retrievedGame.status).toBe('open')
        expect(retrievedGame.players.length).toBe(2)
        expect(retrievedGame.hands.length).toBe(0)
    })

    it('should fail on incorrect token', async () => {
        logic.__token__ = '123'
        try {
            await logic.retrieveGame(gameId)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('jwt malformed')

        }
    })

    it('should fail on incorrect gameId', async () => {
        let _gameId = '5d763e01f3dcf2635b7d495c'
        try {
            await logic.retrieveGame(_gameId)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe(`Game does not exist.`)

        }
    })

    /* Game ID */
    it('should fail on empty name', () =>
        expect(() =>
            logic.retrieveGame('')
        ).toThrow('Game ID is empty or blank')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.retrieveGame(undefined)
        ).toThrow('Game ID with value undefined is not a valid ObjectId')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.retrieveGame('123')
        ).toThrow('Game ID with value 123 is not a valid ObjectId')
    )



    afterAll(async () => {
         Game.deleteMany()
         User.deleteMany()

         database.disconnect()
    })
})