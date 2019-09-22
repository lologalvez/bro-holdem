require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../../../logic')
const { models: { Game, User, Player } } = require('bro-holdem-data')

const { env: { DB_URL_TEST } } = process

describe('logic - leave game', () => {

    before(() => {
        database.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
    })


    let username, email, password, oneId
    let username2, email2, password2, twoId
    let username3, email3, password3, threeId
    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease
    let gameId

    beforeEach(() => {

        // User 1
        username = `username-${Math.random()}`
        email = `email-${Math.random()}@email.com`
        password = `password-${Math.random()}`

        // User 2
        username2 = `username-${Math.random()}`
        email2 = `email-${Math.random()}@email.com`
        password2 = `password-${Math.random()}`

        // User 3
        username3 = `username-${Math.random()}`
        email3 = `email-${Math.random()}@email.com`
        password3 = `password-${Math.random()}`

        // Game
        name = `gameName-${Math.random()}`
        maxPlayers = Number((Math.random() * (6 - 4) + 4).toFixed())
        initialStack = Number((Math.random() * (1500 - 1000) + 1000).toFixed())
        initialBB = Number((Math.random() * (50 - 25) + 25).toFixed())
        initialSB = Number((Math.random() * (50 - 25) + 25).toFixed())
        blindsIncrease = Number(Math.random().toFixed())


        return (async () => {

            // Register users
            await User.deleteMany()
            await Game.deleteMany()
            const userOne = new User({ username, email, password })
            oneId = userOne.id
            const userTwo = new User({ username: username2, email: email2, password: password2 })
            twoId = userTwo.id
            const userThree = new User({ username: username3, email: email3, password: password3 })
            threeId = userThree.id

            // Replicate host game (create new game and add host as a player)
            const newGame = new Game({ name, maxPlayers, initialStack, initialBB, initialSB, currentBB: initialBB, currentSB: initialSB, blindsIncrease })
            gameId = newGame.id
            newGame.host = oneId

            // Create new instance for player one
            const newPlayer = new Player({
                position: newGame.players.length,
                currentStack: initialStack,
                cards: [],
                inHand: false,
                betAmount: 0
            })
            newPlayer.user = oneId
            newGame.players.push(newPlayer)

            // Create new instance for player two
            const newPlayer2 = new Player({
                position: newGame.players.length,
                currentStack: initialStack,
                cards: [],
                inHand: false,
                betAmount: 0
            })
            newPlayer2.user = twoId
            newGame.players.push(newPlayer2)

            // Create new instance for player3
            const newPlayer3 = new Player({
                position: newGame.players.length,
                currentStack: initialStack,
                cards: [],
                inHand: false,
                betAmount: 0
            })
            newPlayer3.user = threeId
            newGame.players.push(newPlayer3)

            return Promise.all([userOne.save(), userTwo.save(), userThree.save(), newGame.save()])
        })()
    })

    it('should succeed on correct data', async () => {
        const result = await logic.leaveGame(gameId, threeId)
        expect(result).not.to.exist
        const retrievedGame = await Game.findById(gameId)
        const user = await User.findById(threeId)
        expect(retrievedGame.players.length).to.equal(3)
        const playersInGame = retrievedGame.players.filter(player => player && player )
        expect(playersInGame.length).to.equal(2)
        expect(retrievedGame.players.includes(threeId)).to.be.false
        
    })

    it('should fail if game does not exist', async () => {
        await Game.deleteMany()
        try {
            await logic.leaveGame(gameId, threeId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('Game does not exist.')
        }
    })

    it('should fail if game does not exist', async () => {
        await User.deleteMany()
        try {
            await logic.leaveGame(gameId, threeId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('User does not exist.')
        }
    })

    it('should fail on empty Game ID', () => {
        expect(() =>
            logic.leaveGame('', threeId)
        ).to.throw(Error, 'Game ID is empty or blank')
    })

    it('should fail on undefined Game ID', () => {
        expect(() =>
            logic.leaveGame(undefined, threeId)
        ).to.throw(Error, `Game ID with value undefined is not a valid ObjectId`)
    })

    it('should fail on non-valid data type for Game ID', () => {
        expect(() =>
            logic.leaveGame('aaaa', threeId)
        ).to.throw(Error, `Game ID with value aaaa is not a valid ObjectId`)
    })

    it('should fail on empty User ID', () => {
        expect(() =>
            logic.leaveGame(gameId, '')
        ).to.throw(Error, 'User ID is empty or blank')
    })

    it('should fail on undefined Game ID', () => {
        expect(() =>
            logic.leaveGame(gameId, undefined)
        ).to.throw(Error, `User ID with value undefined is not a valid ObjectId`)
    })

    it('should fail on non-valid data type for Game ID', () => {
        expect(() =>
            logic.leaveGame(gameId, 'aaaa')
        ).to.throw(Error, `User ID with value aaaa is not a valid ObjectId`)
    })
    after(() => database.disconnect())
})