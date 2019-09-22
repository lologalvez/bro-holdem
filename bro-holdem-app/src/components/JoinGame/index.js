import React, { useContext } from 'react'
import logic from '../../logic'
import Context from '../Context'
import { Link, withRouter } from 'react-router-dom'
import Feedback from '../Feedback'

function JoinGame({ history }) {

    const { setGameId, feedback, setFeedback } = useContext(Context)

    function handleSubmit(event) {
        event.preventDefault()
        const { target: {
            accessKey: { value: accessKey },
        } } = event

        handleJoinGame(accessKey)
    }

    async function handleJoinGame(accessKey) {
        try {
            await logic.joinGame(accessKey)
            setGameId(accessKey)
        } catch (error) {
            setFeedback(error.message)
        }
    }

    function handleLogout() {
        logic.logUserOut()
        history.push('/')
    }

    return <>
        <div className="landing">
            <div className="landing__split">
                <section className="card">
                    <Feedback message={feedback}/>
                    <div className="card__title">
                        <h2>Join Game</h2>
                    </div>
                    <form className="form" onSubmit={handleSubmit}>
                        <input className="form__input" type="text" name="accessKey" placeholder="Access key..." />
                        <div className="card__buttons">
                            <button className="card__button">Submit</button>
                            <Link className="back__button" to="/"><i className="fas fa-chevron-circle-left"></i></Link>
                        </div>
                    </form> 
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

export default withRouter(JoinGame)