import logic from '..'

describe('logic - is user in game in', () => {
    beforeEach(async () => {
        logic.__gameId__ = '123'
    })

    it('should succeed on correct data', async () => {
        const inGame = logic.isUserInGame()

        expect(typeof inGame).toBe('boolean')
        expect(inGame).toBeTruthy()
    })
})
