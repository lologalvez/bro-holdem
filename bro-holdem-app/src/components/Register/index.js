import React, { useContext } from 'react'
import logic from '../../logic'
import Context from '../Context'
import { Link, withRouter } from 'react-router-dom'
import Feedback from '../Feedback'


function Register({ history }) {

    const { setSubmitRegister, feedback, setFeedback } = useContext(Context)

    function handleSubmit(event) {
        event.preventDefault()
        const { target: {
            username: { value: username },
            email: { value: email },
            password: { value: password },
            repassword: { value: repassword }
        } } = event
        handleRegister(username, email, password, repassword)
    }

    async function handleRegister(username, email, password, repassword) {

        try {
            await logic.registerUser(username, email, password, repassword)
            setSubmitRegister(true)
            history.push('/register-success')
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
                        <h1>Register</h1>
                    </div>
                    <form className="form" onSubmit={handleSubmit}>
                        <input className="form__input" type="text" name="username" placeholder="Username..." />
                        <input className="form__input" type="text" name="email" placeholder="Email..." />
                        <input className="form__input" type="password" name="password" placeholder="Password..." />
                        <input className="form__input" type="password" name="repassword" placeholder="Repeat password..." />
                        <div className="card__buttons">
                            <button className="card__button submit">Submit</button>
                            <Link className="back__button" to="/"><i className="fas fa-chevron-circle-left"></i></Link>
                        </div>
                    </form>
                </section>
            </div>
            <div className="landing__split landing__split--right">
            </div>
        </div>
        </>
}

export default withRouter(Register)