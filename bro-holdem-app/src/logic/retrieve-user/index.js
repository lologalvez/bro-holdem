const REACT_APP_API_URL = process.env.REACT_APP_API_URL
export default function () {

    return (async () => {
        const response = await fetch(`${REACT_APP_API_URL}/users`, {
            method: 'GET',
            headers: { 'authorization': `bearer ${this.__token__}` },
        })

        if (response.status !== 200) {
            const { error } = await response.json()
            throw new Error(error)
        } else {
            const { user } = await response.json()
            return user
        }
    })()
}