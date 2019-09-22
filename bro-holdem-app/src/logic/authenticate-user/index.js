import { validate } from 'bro-holdem-utils'
const REACT_APP_API_URL = process.env.REACT_APP_API_URL

export default function (email, password) {

    validate.string(email, 'email')
    validate.email(email, 'email')
    validate.string(password, 'password')

    return (async () => {
        const response = await fetch(`${REACT_APP_API_URL}/auth`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        if (response.status !== 200) {
            const { error } = await response.json()
            throw Error(error)
        } else {
            const { token } = await response.json()
            this.__token__ = token
        }
    })()
}