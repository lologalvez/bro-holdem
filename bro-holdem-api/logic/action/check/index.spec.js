require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../../../logic')
const { models: { Action, Game, User, Player, Hand } } = require('bro-holdem-data')

const { env: { DB_URL_TEST } } = process

describe('logic - action - check', () => {

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
        //initialBB = Number((Math.random() * (50 - 25) + 25).toFixed())
        //initialSB = Number((Math.random() * (50 - 25) + 25).toFixed())
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

            // Deal flop cards
            let randomNum
            let match
            for (i = 0; i < 3; i++) {
                do {
                    randomNum = Number((Math.random() * (52 - 1) + 1).toFixed())
                    match = newHand.usedCards.includes(randomNum)
                } while (match)
                newHand.tableCards.push(randomNum)
                newHand.usedCards.push(randomNum)
            }

            // Players setup and dealing
            newGame.players.forEach(player => {

                // Card dealing
                for (i = 0; i < 2; i++) {
                    do {
                        randomNum = Number((Math.random() * (52 - 1) + 1).toFixed())
                        match = newHand.usedCards.includes(randomNum)
                    } while (match)
                    player.cards.push(randomNum)
                    newHand.usedCards.push(randomNum)
                }

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
                newHand.pot = newGame.currentBB + newGame.currentSB

            })


            // Emulate turn
            newGame.players[1].betAmount = 50
            newHand.pot = 100
            newHand.turnPos = 2

            newGame.hands.push(newHand)

            await Promise.all([userOne.save(), userTwo.save(), userThree.save(), newGame.save()])
        })()
    })

    it('should succeed on correct data', async () => {
        const result = await logic.check(gameId, threeId)
        expect(result).not.to.exist

        const retrievedGame = await Game.findById(gameId)
        const callPlayer = retrievedGame.players.find(player => String(player.user) === threeId)
        const expectedPot = retrievedGame.players.reduce((acc, player) => acc + player.betAmount, 0)
        const highestBet = Math.max.apply(Math, retrievedGame.players.map(key => key.betAmount))
        const lastAction = await Action.find().sort({ _id: -1 }).limit(1)
        expect(retrievedGame.status).to.equal('playing')
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].pot).to.equal(expectedPot)
        expect(callPlayer.betAmount).to.equal(highestBet)
        expect(lastAction).to.exist
        expect(lastAction[0].type).to.equal('check')
        expect(lastAction[0].user).to.deep.equal(callPlayer.user)
        expect(lastAction[0].player).to.deep.equal(callPlayer._id)
        expect(lastAction[0].hand).to.deep.equal(retrievedGame.hands[retrievedGame.hands.length - 1]._id)
        expect(lastAction[0].game).to.deep.equal(retrievedGame._id)

    })

    it('should fail if game does not exist', async () => {

        await Game.deleteMany()

        try {
            await logic.check(gameId, threeId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('Game does not exist.')
        }
    })


    it('should fail on empty Game ID', () => {
        expect(() =>
            logic.check('', threeId)
        ).to.throw(Error, 'Game ID is empty or blank')
    })

    it('should fail on undefined Game ID', () => {
        expect(() =>
            logic.check(undefined, threeId)
        ).to.throw(Error, `Game ID with value undefined is not a valid ObjectId`)
    })

    it('should fail on non-valid data type for Game ID', () => {
        expect(() =>
            logic.check('aaaa', threeId)
        ).to.throw(Error, `Game ID with value aaaa is not a valid ObjectId`)
    })

    it('should fail on empty User ID', () => {
        expect(() =>
            logic.check(gameId, '')
        ).to.throw(Error, 'User ID is empty or blank')
    })

    it('should fail on undefined User ID', () => {
        expect(() =>
            logic.check(gameId, undefined)
        ).to.throw(Error, `User ID with value undefined is not a valid ObjectId`)
    })

    it('should fail on non-valid data type for Game ID', () => {
        expect(() =>
            logic.check(gameId, 'aaaa')
        ).to.throw(Error, `User ID with value aaaa is not a valid ObjectId`)
    })
    after(() => database.disconnect())
})