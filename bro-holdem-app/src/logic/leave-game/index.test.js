require('dotenv').config()
import logic from '..'
import { database, models } from 'bro-holdem-data'
const REACT_APP_DB_URL_TEST = process.env.REACT_APP_DB_URL_TEST
const REACT_APP_JWT_SECRET_TEST = process.env.REACT_APP_JWT_SECRET_TEST
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const { Game, User, Player } = models

const { random } = Math

describe.only('logic - leave game', () => {
    beforeAll(() => database.connect(REACT_APP_DB_URL_TEST))

    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId
    let username, email, password, repassword
    let token, hash, user, users = []
    let gameId, userId

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

        userId = users[0].id

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
        const response = await logic.leaveGame(gameId)
        const game = await Game.findById(gameId)
        expect(game).toBeDefined()
        expect(game.id).toBe(gameId)
        expect(game.players.length).toBe(2)
        const playersInGame = game.players.filter(player => player && player)
        expect(playersInGame.length).toBe(1)
        const currentHand = game.hands[game.hands.length - 1]
        if (currentHand) expect(game.hands[game.hands.length - 1].turnPos).not.toBe(0)
    })

    it('should fail on incorrect token', async () => {
        logic.__token__ = '123'
        try {
            await logic.leaveGame(gameId)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('jwt malformed')

        }
    })

    it('should fail on incorrect gameId', async () => {
        let _gameId = '5d763e01f3dcf2635b7d495c'
        try {
            await logic.leaveGame(_gameId)
        } catch (error) {
            expect(error).toBeDefined()
            expect(error.message).toBe('Game does not exist.')

        }
    })

    /* Name */
    it('should fail on empty name', () =>
        expect(() =>
            logic.leaveGame('')
        ).toThrow('Game ID is empty or blank')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.leaveGame(undefined)
        ).toThrow('Game ID with value undefined is not a valid ObjectId')
    )

    it('should fail on undefined name', () =>
        expect(() =>
            logic.leaveGame('123')
        ).toThrow('Game ID with value 123 is not a valid ObjectId')
    )



    afterAll(() => database.disconnect())
})