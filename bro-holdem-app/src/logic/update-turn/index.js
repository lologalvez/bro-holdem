const REACT_APP_API_URL = process.env.REACT_APP_API_URL
export default function (gameId) {

    return (async () => {
        const response = await fetch(`${REACT_APP_API_URL}/games/${gameId}/turn`, {
            method: 'POST',
            headers: { 'authorization': `bearer ${this.__token__}` },
        })

        if (response.status !== 200) {
            const { error } = await response.json()
            throw Error(error)
        } else {
            return await response.json()
        }
    })()
}