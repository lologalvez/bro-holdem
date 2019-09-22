import { validate } from 'bro-holdem-utils'
const REACT_APP_API_URL = process.env.REACT_APP_API_URL

export default function (gameId, raise) {

    const raiseTo = Number(raise)
    validate.objectId(gameId, 'Game ID')

    return (async () => {
        const response = await fetch(`${REACT_APP_API_URL}/games/${gameId}/actions/raise`, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'authorization': `bearer ${this.__token__}` },
            body: JSON.stringify({ raiseAmount: Number(raiseTo) })
        })

        if (response.status !== 200) {
            const { error } = await response.json()
            throw Error(error)
        }
    })()
}