require('dotenv').config()
import logic from '..'
import { database, models } from 'bro-holdem-data'
const REACT_APP_DB_URL_TEST = process.env.REACT_APP_DB_URL_TEST
const REACT_APP_JWT_SECRET_TEST = process.env.REACT_APP_JWT_SECRET_TEST
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const { Game, User, Player } = models

const { random } = Math

describe.only('logic - deal hand', () => {
    beforeAll(() => database.connect(REACT_APP_DB_URL_TEST))

    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId
    let username, email, password, repassword
    let token, hash, user, users = []
    let gameId

    beforeEach(async () => {
        name = `gameName - ${random()} `
        maxPlayers = `${(random() * 9).toFixed()}`
        initialStack = `${(random() * 1500).toFixed()}`
        initialBB = `${(random() * (50 - 25) + 25).toFixed()}`
        initialSB = `${(random() * (25 - 10) + 10).toFixed()}`
        blindsIncrease = `${(random() * (10 - 2) + 2).toFixed()}`

        await User.deleteMany()
        await Game.deleteMany()

        for (let i = 0; i < 2; i++) {
            username = `username - ${random()} `
            email = `email-${random()}@email.com`
            password = `pass-${random()} `
            repassword = password

            hash = await bcrypt.hash(password, 10)
            user = new User({ username, email, password: hash })
            users[i] = user
            await user.save()
        }

        token = jwt.sign({ sub: users[0].id }, REACT_APP_JWT_SECRET_TEST)
        logic.__token__ = token

        // Create new game
        const newGame = new Game({ name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease })
        gameId = newGame.id
        newGame.host = users[0].id

        let newPlayer
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

        await newGame.save()
    })

    it('should succeed on correct data', async () => {
        const response = await logic.dealHand(gameId)
        expect(response).toBeUndefined()
        const game = await Game.findById(gameId)
        expect(game.id).toBe(gameId)
        expect(game.players.length).toBe(2)
        debugger
        expect(game.players[0].cards.length).toBe(2)
        expect(game.players[1].cards.length).toBe(2)
        expect(game.players[0].inHand).toBeTruthy()
        expect(game.players[1].inHand).toBeTruthy()
        expect(game.hands.length).toBe(1)
        expect(game.hands[0].tableCards.length).toBe(3)
        expect(game.hands[0].usedCards.length).toBe(7)
        expect(game.hands[0].usedCards.length).toBe(7)
        expect(game.status).toBe('playing')
        expect(String(game.host)).toBe(users[0].id)
    })

    it('should fail on incorrect token', async () => {
        logic.__token__ = '123'
        try {
            await logic.dealHand(gameId)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('jwt malformed')

        }
    })

    it('should fail on incorrect gameId', async () => {
        let _gameId = '5d763e01f3dcf2635b7d495c'
        try {
            await logic.dealHand(_gameId)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('Game does not exist.')

        }
    })

    it('should fail on insufficient players to start a game', async () => {
        const game = await Game.findById(gameId)
        game.players.pop()
        await game.save()

        try {
            await logic.dealHand(gameId)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('Not enough players to start a game.')
        }
    })


    /* Name */
    it('should fail on empty name', () =>
        expect(() =>
            logic.dealHand('')
        ).toThrow('Game ID is empty or blank')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.dealHand(undefined)
        ).toThrow('Game ID with value undefined is not a valid ObjectId')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.dealHand('123')
        ).toThrow('Game ID with value 123 is not a valid ObjectId')
    )



    afterAll(() => database.disconnect())
})