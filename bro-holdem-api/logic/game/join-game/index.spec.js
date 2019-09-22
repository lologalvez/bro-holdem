require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../../../logic')
const { models: { Game, User, Player } } = require('bro-holdem-data')

const { env: { DB_URL_TEST } } = process

describe('logic - join game', () => {

    before(() => {
        database.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
    })


    let username, email, password, hostId
    let username2, email2, password2, joinerId
    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease
    let gameId

    beforeEach(() => {
        // User 1: Host
        username = `username-${Math.random()}`
        email = `email-${Math.random()}@email.com`
        password = `password-${Math.random()}`

        // User 2: Joiner
        username2 = `username-${Math.random()}`
        email2 = `email-${Math.random()}@email.com`
        password2 = `password-${Math.random()}`


        // Game
        name = `gameName-${Math.random()}`
        maxPlayers = Number((Math.random() * (6 - 4) + 4).toFixed())
        initialStack = Number(Math.random().toFixed())
        initialBB = Number((Math.random() * (50 - 25) + 25).toFixed())
        initialSB = Number((Math.random() * (50 - 25) + 25).toFixed())
        blindsIncrease = Number(Math.random().toFixed())


        return (async () => {

            // Register users
            await User.deleteMany()
            await Game.deleteMany()
            const host = new User({ username, email, password })
            hostId = host.id
            const joiner = new User({ username: username2, email: email2, password: password2 })
            joinerId = joiner.id

            // Replicate host game (create new game and add host as a player)
            const newGame = new Game({ name, maxPlayers, initialStack, initialBB, initialSB, currentBB: initialBB, currentSB: initialSB, blindsIncrease })
            gameId = newGame.id
            newGame.host = hostId

            // Create new instance of player
            const newPlayer = new Player({
                position: newGame.players.length,
                currentStack: initialStack,
                cards: [],
                inHand: false,
                betAmount: 0
            })
            newPlayer.user = hostId
            newGame.players.push(newPlayer)

            return Promise.all([host.save(), joiner.save(), newGame.save()])
        })()
    })


    it('should succeed on correct data', async () => {
        const result = await logic.joinGame(gameId, joinerId)
        expect(result).to.exist
        const game = await Game.findById(gameId)
        const user = await User.findById(joinerId)
        expect(result.userName).to.equal(user.username)
        expect(result.gameName).to.equal(game.name)
        expect(game).to.exist
        expect(game.players.length).to.equal(2)
        expect(String(game.players[0].user)).to.equal(hostId)
        expect(String(game.players[1].user)).to.equal(joinerId)
    })

    it('should fail if the game does not exist', async () => {

        try {
            await logic.joinGame('5d6f7f1a13d960702965554a', joinerId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal(`Game with id 5d6f7f1a13d960702965554a does not exist.`)
        }
    })

    it('should fail if the user does not exist', async () => {

        try {
            await logic.joinGame(gameId, '5d6f7f1a13d960702965554c')
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal(`User with id 5d6f7f1a13d960702965554c does not exist.`)
        }
    })

    it('should fail if the playing room is full', async () => {
        const game = await Game.findById(gameId)
        game.maxPlayers = 1
        await game.save()

        try {
            await logic.joinGame(gameId, joinerId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('Game room is full.')
        }
    })

    /* Name */
    it('should fail on empty game ID', () =>
        expect(() =>
            logic.joinGame('', joinerId)
        ).to.throw('Game ID is empty or blank')
    )

    it('should fail on undefined game ID', () =>
        expect(() =>
            logic.joinGame(undefined, joinerId)
        ).to.throw(`Game ID with value undefined is not a valid ObjectId`)
    )

    it('should fail on empty user ID', () =>
        expect(() =>
            logic.joinGame(gameId, '')
        ).to.throw(`User ID is empty or blank`)
    )

    it('should fail on undefined user ID', () =>
        expect(() =>
            logic.joinGame(gameId, undefined)
        ).to.throw(`User ID with value undefined is not a valid ObjectId`)
    )

    after(() => database.disconnect())
})
