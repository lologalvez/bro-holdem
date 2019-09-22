require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../..')
const { models: { Card, Game, User, Player, Hand } } = require('bro-holdem-data')

const { env: { DB_URL_TEST } } = process

describe('logic - resolve hand', () => {

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
        initialStack = 1500
        initialBB = 50
        initialSB = 25
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
            three = userThree.id

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

            // Deal first hand
            const newHand = new Hand({
                pot: 0,
                dealerPos: 0,
                bbPos: newGame.players.length - 1,
                sbPos: newGame.players.length - 2,
                turnPos: 1,
                round: 0
            })

            newGame.status = 'playing'

            // Assign hands manually for testing purposes
            newHand.tableCards = [
                await Card.findOne({ ref: 'Ts' }),
                await Card.findOne({ ref: '6s' }),
                await Card.findOne({ ref: '5h' }),
                await Card.findOne({ ref: '2h' }),
                await Card.findOne({ ref: '3d' })
            ]


            // Players setup and dealing
            for (const player of newGame.players) {

                // Status
                player.inHand = true

                // Blinds assignment
                let isBlind, blindAmount, stackLeft
                if (player.position === newHand.bbPos) { isBlind = true; blindAmount = newGame.currentBB }
                if (player.position === newHand.sbPos) { isBlind = true; blindAmount = newGame.currentSB }
                if (isBlind) {
                    stackLeft = player.currentStack - blindAmount
                    if (stackLeft < 0) {
                        player.betAmount = player.currentStack
                        player.currentStack = 0
                    } else if (stackLeft > 0) {
                        player.betAmount = blindAmount
                        player.currentStack = stackLeft
                    }
                    isBlind = false
                }
            }

            // Assign hands manually for testing purposes
            newGame.players[0].cards = [await Card.findOne({ ref: 'As' }), await Card.findOne({ ref: 'Ad' })]
            newGame.players[0].cards = [await Card.findOne({ ref: 'Ks' }), await Card.findOne({ ref: 'Kd' })]
            newGame.players[0].cards = [await Card.findOne({ ref: 'Qs' }), await Card.findOne({ ref: 'Qd' })]

            newHand.pot = newGame.currentBB + newGame.currentSB

            // Emulating river betting round
            const game = await Game.findById(gameId)
            // Player 1 bets 500
            newGame.players[0].betAmount = 500
            newGame.players[0].currentStack -= 500
            newHand.pot += newGame.players[0].betAmount

            // Player 2 folds
            newGame.players[1].inHand = false

            // Player 3 calls 500
            newGame.players[2].betAmount = 500
            newGame.players[2].currentStack -= 500
            newHand.pot += newGame.players[2].betAmount

            newHand.round = 3
            newHand.turnPos = newHand.endPos

            newGame.hands.push(newHand)

            await Promise.all([userOne.save(), userTwo.save(), userThree.save(), newGame.save()])
        })()
    })

    it('should succeed on correct data', async () => {
        const result = await logic.resolveHand(gameId)
        expect(result).not.to.exist
        const retrievedGame = await Game.findById(gameId)
        expect(retrievedGame.players[0].currentStack).to.equal(2075)
        expect(retrievedGame.players[1].currentStack).to.equal(1475)
        expect(retrievedGame.players[2].currentStack).to.equal(950)
    })

    it('should fail if game does not exist', async () => {

        await Game.deleteMany()

        try {
            await logic.resolveHand(gameId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('Game does not exist.')
        }
    })

    it('should fail if only one player in hand', async () => {

        const game = await Game.findById(gameId)
        game.players.splice(0, 1)
        await game.save()

        try {
            await logic.resolveHand(gameId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('Only one player in hand.')
        }
    })


    it('should fail if no hands dealt yet', async () => {

        const game = await Game.findById(gameId)
        game.hands.pop()
        await game.save()

        try {
            await logic.resolveHand(gameId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('There are no hands dealt yet.')
        }
    })



    it('should fail on empty Game ID', () => {
        expect(() =>
            logic.resolveHand('')
        ).to.throw(Error, 'Game ID is empty or blank')
    })

    it('should fail on undefined Game ID', () => {
        expect(() =>
            logic.resolveHand(undefined)
        ).to.throw(Error, `Game ID with value undefined is not a valid ObjectId`)
    })

    it('should fail on non-valid data type for Game ID', () => {
        expect(() =>
            logic.resolveHand('aaaa')
        ).to.throw(Error, `Game ID with value aaaa is not a valid ObjectId`)
    })

    after(() => database.disconnect())
})