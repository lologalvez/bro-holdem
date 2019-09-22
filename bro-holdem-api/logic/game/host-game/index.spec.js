require('dotenv').config()
const { database } = require('bro-holdem-data')
const { expect } = require('chai')
const logic = require('../../../logic')
const { models: { Game, User } } = require('bro-holdem-data')

const { env: { DB_URL_TEST } } = process

describe('logic - host game', () => {

    before(() => {
        database.connect(DB_URL_TEST, { useNewUrlParser: true, useUnifiedTopology: true })
    })

    let name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, status
    let username, email, password, userOne, oneId
    let hostId, validHost

    beforeEach(() => {
        // User 1
        username = `username-${Math.random()}`
        email = `email-${Math.random()}@email.com`
        password = `password-${Math.random()}`

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
            const userOne = new User({ username, email, password })
            hostId = userOne.id
            validHost = String(hostId)

            await userOne.save()

        })()
    })

    it('should succeed on correct data', async () => {
        const result = await logic.hostGame(
            name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, validHost
        )
        expect(result).to.exist

        const retrievedGame = await Game.findById(result)
        expect(retrievedGame).to.exist
        expect(retrievedGame.name).to.equal(name)
        expect(retrievedGame.maxPlayers).to.equal(maxPlayers)
        expect(retrievedGame.initialStack).to.equal(initialStack)
        expect(retrievedGame.initialBB).to.equal(initialBB)
        expect(retrievedGame.initialSB).to.equal(initialSB)
        expect(retrievedGame.blindsIncrease).to.equal(blindsIncrease)
        expect(String(retrievedGame.host)).to.equal(validHost)
        expect(String(retrievedGame.players[0].user)).to.equal(validHost)
        expect(String(retrievedGame.status)).to.equal('open')
    })

    it('should fail if game already exists', async () => {

        await Game.deleteMany()
        const game = await Game.create({ name, maxPlayers, initialStack, initialBB, initialSB, currentBB: initialBB, currentSB: initialSB, blindsIncrease, validHost })

        try {
            await logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, validHost)
        } catch (error) {
            expect(error).to.exist
            expect(error.message).to.equal('Game already exists.')
        }
    })


    it('should fail on empty name', () => {
        expect(() =>
            logic.hostGame('', maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, 'name is empty or blank')
    })

    it('should fail on undefined name', () => {
        expect(() =>
            logic.hostGame(undefined, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `name with value undefined is not a string`)
    })

    it('should fail on non-valid data type for name', () => {
        expect(() =>
            logic.hostGame(123, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `name with value 123 is not a string`)
    })

    it('should fail on empty maxPlayers', () => {
        expect(() =>
            logic.hostGame(name, '', initialStack, initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, 'maxPlayers is empty or blank')
    })

    it('should fail on undefined name', () => {
        expect(() =>
            logic.hostGame(name, undefined, initialStack, initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `maxPlayers with value undefined is not a number`)
    })

    it('should fail on non-valid data type for name', () => {
        expect(() =>
            logic.hostGame(name, 'blablabla', initialStack, initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `maxPlayers with value blablabla is not a number`)
    })

    it('should fail on empty initialStack', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, '', initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, 'initialStack is empty or blank')
    })

    it('should fail on undefined initialStack', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, undefined, initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `initialStack with value undefined is not a number`)
    })

    it('should fail on non-valid data type for initialStack', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, 'blablabla', initialBB, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `initialStack with value blablabla is not a number`)
    })

    it('should fail on empty initialBB', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, '', initialSB, blindsIncrease, hostId)
        ).to.throw(Error, 'initialBB is empty or blank')
    })

    it('should fail on undefined initialBB', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, undefined, initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `initialBB with value undefined is not a number`)
    })

    it('should fail on non-valid data type for initialBB', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, 'blablabla', initialSB, blindsIncrease, hostId)
        ).to.throw(Error, `initialBB with value blablabla is not a number`)
    })

    it('should fail on empty initialSB', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, '', blindsIncrease, hostId)
        ).to.throw(Error, 'initialSB is empty or blank')
    })

    it('should fail on undefined initialSB', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, undefined, blindsIncrease, hostId)
        ).to.throw(Error, `initialSB with value undefined is not a number`)
    })

    it('should fail on non-valid data type for initialSB', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, 'blablabla', blindsIncrease, hostId)
        ).to.throw(Error, `initialSB with value blablabla is not a number`)
    })

    it('should fail on empty blindsIncrease', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, '', hostId)
        ).to.throw(Error, 'blindsIncrease is empty or blank')
    })

    it('should fail on undefined blindsIncrease', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, undefined, hostId)
        ).to.throw(Error, `blindsIncrease with value undefined is not a number`)
    })

    it('should fail on non-valid data type for blindsIncrease', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, 'blablabla', hostId)
        ).to.throw(Error, `blindsIncrease with value blablabla is not a number`)
    })

    it('should fail on empty host', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, '')
        ).to.throw(Error, 'host ID is empty or blank')
    })

    it('should fail on undefined host', () => {
        expect(() =>
            logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease, undefined)
        ).to.throw(Error, `host ID with value undefined is not a valid ObjectId`)
    })

    after(() => database.disconnect())
})