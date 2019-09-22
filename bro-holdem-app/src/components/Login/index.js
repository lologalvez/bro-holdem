import React, { useContext } from 'react'
import logic from '../../logic'
import Context from '../Context'
import { Link } from 'react-router-dom'
import Feedback from '../Feedback'

function Login() {

    const { setSubmitRegister, setCredentials, feedback, setFeedback } = useContext(Context)

    setSubmitRegister(null)

    function handleSubmit(event) {
        event.preventDefault()
        const { target: { email: { value: email }, password: { value: password } } } = event
        handleLogin(email, password)
    }

    async function handleLogin(email, password) {
        try {
            await logic.authenticateUser(email, password)
            setCredentials(true)
            setFeedback(null)
        } catch (error) {
            setFeedback(error.message)
        }
    }

    return <>
       <div className="landing">
            <div className="landing__split">
                <section className="card">
                    <Feedback message={feedback}/>
                    <div className="card__title">
                        <h1>Login</h1>
                    </div>
                    <form className="form" onSubmit={handleSubmit}>
                        <input className="form__input" type="text" name="email" placeholder="Email..." />
                        <input className="form__input" type="password" name="password" placeholder="Password..." />
                        <div className="card__buttons">
                            <button className="card__button submit">Submit</button>
                            <Link className="back__button" to="/"><i className="fas fa-chevron-circle-left"></i></Link>
                        </div>
                    </form>
                </section>
            </div>
            <div className="landing__split">
            </div>
        </div>
    </>
}

export default Login