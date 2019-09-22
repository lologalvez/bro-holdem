require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../../../logic')
const { models: { Game, User, Player, Hand, Card } } = require('bro-holdem-data')

const { env: { DB_URL_TEST } } = process

describe('utils - update turn', () => {

    before(() => {
        database.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
    })

    let username, email, password, oneId
    let username2, email2, password2, twoId
    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease
    let gameId

    const raiseTo = 300

    beforeEach(() => {

        // User 1
        username = `username-${Math.random()}`
        email = `email-${Math.random()}@email.com`
        password = `password-${Math.random()}`

        // User 2
        username2 = `username-${Math.random()}`
        email2 = `email-${Math.random()}@email.com`
        password2 = `password-${Math.random()}`

        name = `gameName-${Math.random()}`
        maxPlayers = Number((Math.random() * (6 - 4) + 4).toFixed())
        initialStack = Number((Math.random() * (1500 - 1000) + 1000).toFixed())
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

            // Deal first hand
            const newHand = new Hand({
                pot: 0,
                dealerPos: 0,
                bbPos: newGame.players.length - 1,
                sbPos: newGame.players.length - 2,
                turnPos: 1,
                endPos: 0,
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

            newGame.hands.push(newHand)

            await Promise.all([userOne.save(), userTwo.save(), newGame.save()])
        })()
    })

    it('should succeed on correct data (turn update)', async () => {
        const result = await logic.updateTurn(gameId)
        expect(result).to.exist
        expect(result.message).to.equal('Turn updated successfully')
        expect(result.stage).to.equal('Turn')
        const retrievedGame = await Game.findById(gameId)
        expect(retrievedGame.hands[0].turnPos).to.equal(0)
    })

    it('should succeed on correct data (round end - flop)', async () => {
        const game = await Game.findById(gameId)
        game.players[0].betAmount = 300
        game.players[1].betAmount = 300
        game.hands[game.hands.length - 1].turnPos = 0
        game.hands[game.hands.length - 1].endPos = 0
        await game.save()

        const result = await logic.updateTurn(gameId)
        expect(result).to.exist
        expect(result.message).to.equal('Round resolved successfully')
        expect(result.stage).to.equal('Round')
        const retrievedGame = await Game.findById(gameId)
        expect(retrievedGame.hands.length).to.equal(1)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].turnPos).to.equal(1)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].endPos).to.equal(0)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].round).to.equal(1)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].tableCards.length).to.equal(3)
    })

    it('should succeed on correct data (round end - flop)', async () => {
        const game = await Game.findById(gameId)
        game.players[0].betAmount = 300
        game.players[1].betAmount = 300
        game.hands[game.hands.length - 1].turnPos = 0
        game.hands[game.hands.length - 1].endPos = 0
        game.hands[game.hands.length - 1].round = 1
        await game.save()

        const result = await logic.updateTurn(gameId)
        expect(result).to.exist
        expect(result.message).to.equal('Round resolved successfully')
        expect(result.stage).to.equal('Round')
        const retrievedGame = await Game.findById(gameId)
        expect(retrievedGame.hands.length).to.equal(1)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].turnPos).to.equal(1)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].endPos).to.equal(0)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].round).to.equal(2)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].tableCards.length).to.equal(4)
    })

    it('should succeed on correct data (round end - turn)', async () => {
        const game = await Game.findById(gameId)
        game.players[0].betAmount = 300
        game.players[1].betAmount = 300
        game.hands[game.hands.length - 1].turnPos = 0
        game.hands[game.hands.length - 1].endPos = 0
        game.hands[game.hands.length - 1].round = 2
        const turnCard = await Card.find({ ref: 'Ts' })
        game.hands[game.hands.length - 1].tableCards.push(turnCard)
        game.hands[game.hands.length - 1].usedCards.push(turnCard)
        await game.save()

        const result = await logic.updateTurn(gameId)
        expect(result).to.exist
        expect(result.message).to.equal('Round resolved successfully')
        expect(result.stage).to.equal('Round')
        const retrievedGame = await Game.findById(gameId)
        expect(retrievedGame.hands.length).to.equal(1)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].turnPos).to.equal(1)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].endPos).to.equal(0)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].round).to.equal(3)
        expect(retrievedGame.hands[retrievedGame.hands.length - 1].tableCards.length).to.equal(5)
    })

    it('should fail if game does not exist', async () => {
        await Game.deleteMany()
        try {
            await logic.updateTurn(gameId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('Game does not exist.')
        }
    })


    it('should fail if there is only one player left', async () => {
        const retrievedGame = await Game.findById(gameId)
        retrievedGame.players.pop()
        await retrievedGame.save()
        try {
            await logic.updateTurn(gameId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('The game is over.')
        }
    })


    it('should fail if there are no hands to play', async () => {
        const retrievedGame = await Game.findById(gameId)
        retrievedGame.hands.pop()
        await retrievedGame.save()
        try {
            await logic.updateTurn(gameId)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('There are no hands dealt yet.')
        }
    })

    it('should fail on empty Game ID', () => {
        expect(() =>
            logic.updateTurn('')
        ).to.throw(Error, 'Game ID is empty or blank')
    })

    it('should fail on undefined Game ID', () => {
        expect(() =>
            logic.updateTurn(undefined)
        ).to.throw(Error, `Game ID with value undefined is not a valid ObjectId`)
    })

    it('should fail on non-valid data type for Game ID', () => {
        expect(() =>
            logic.updateTurn('aaaa')
        ).to.throw(Error, `Game ID with value aaaa is not a valid ObjectId`)
    })

    after(() => database.disconnect())
})