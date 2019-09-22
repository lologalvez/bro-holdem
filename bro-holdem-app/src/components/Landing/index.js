import React from 'react'
import { Link, withRouter } from 'react-router-dom'

function Landing({ history }) {
    return <>
        <div className="landing">
            <div className="landing__split">
                <section className="card">
                    <div className="card__title">
                        <div className="card__logo">
                            <img src="/logo192.png"></img>
                        </div>
                        <div className="card__company">
                            <h1>BRO HOLDEM</h1>
                        </div>
                    </div>
                    <div className="card__buttons">
                        <Link className="card__button card__button--login" to="/login">Login</Link>
                        <Link className="card__button card__button--register" to="/register">Register</Link>
                    </div>
                </section>
            </div>
            <div className="landing__split">
            </div>
        </div>
    </>
}

export default withRouter(Landing)
