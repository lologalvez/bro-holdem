import React, { useContext } from 'react'
import Context from '../Context'
import { Link, withRouter } from 'react-router-dom'
import logic from '../../logic'

function Home({ history }) {

    const { user } = useContext(Context)

    function handleLogout() {
        logic.logUserOut()
        history.push('/')
    }

    return <>
        <div className="landing">
            <div className="landing__split">
                <section className="card">
                    <div className="card__title">
                        {user &&
                            <h2>Hello, {user.username}</h2>}
                        {!user &&
                            <h2>Hello, user</h2>}
                    </div>
                    <div className="card__buttons">
                        <Link className="card__button card__button--host" to="/host-game">Host Game</Link>
                        <Link className="card__button card__button--join" to="/join-game">Join Game</Link>
                    </div>
                </section>
            </div>
            <div className="landing__split landing__split--right">
                <div className="card__buttons">
                    <button onClick={handleLogout} className="card__button card__button--logout">Logout</button>
                </div>
            </div>
        </div>
    </>
}

export default withRouter(Home)