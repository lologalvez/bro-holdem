import { validate } from 'bro-holdem-utils'
const REACT_APP_API_URL = process.env.REACT_APP_API_URL

export default function (gameId) {

    validate.objectId(gameId, 'Game ID')

    return (async () => {
        const response = await fetch(`${REACT_APP_API_URL}/games/${gameId}/actions/check`, {
            method: 'POST',
            headers: { 'authorization': `bearer ${this.__token__}` },
        })

        if (response.status !== 200) {
            const { error } = await response.json()
            throw Error(error)
        }
    })()
}