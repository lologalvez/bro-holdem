import { validate } from 'bro-holdem-utils'
const REACT_APP_API_URL = process.env.REACT_APP_API_URL
export default function (username, email, password, repassword) {

    validate.string(username, 'username')
    validate.string(email, 'email')
    validate.email(email, 'email')
    validate.string(password, 'password')

    if (password !== repassword) throw Error('Passwords do not match')

    return (async () => {
        const response = await fetch(`${REACT_APP_API_URL}/users`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })

        if (response.status !== 201) {
            const { error } = await response.json()
            throw Error(error)
        } else {
            return await response.json()
        }
    })()
}