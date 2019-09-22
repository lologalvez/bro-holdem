import { validate } from 'bro-holdem-utils'
const REACT_APP_API_URL = process.env.REACT_APP_API_URL


export default function (name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease) {

    // Convert specific fields retrieved from form as strings to numbers

    validate.string(name, 'name')
    validate.string(maxPlayers, 'maxPlayers')
    validate.string(initialStack, 'initialStack')
    validate.string(initialBB, 'initialBB')
    validate.string(initialSB, 'initialSB')
    validate.string(blindsIncrease, 'blindsIncrease')

    maxPlayers = Number(maxPlayers)
    initialStack = Number(initialStack)
    initialBB = Number(initialBB)
    initialSB = Number(initialSB)
    blindsIncrease = Number(blindsIncrease)

    return (async () => {
        const response = await fetch(`${REACT_APP_API_URL}/games`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'authorization': `bearer ${this.__token__}` },
            body: JSON.stringify({
                name,
                maxPlayers,
                initialStack,
                initialBB,
                initialSB,
                blindsIncrease
            })
        })

        if (response.status !== 201) {
            const { error } = await response.json()
            throw Error(error)
        }
        const resp = await response.json()
        this.__gameId__ = resp.gameId
        return resp.gameId
    })()
}