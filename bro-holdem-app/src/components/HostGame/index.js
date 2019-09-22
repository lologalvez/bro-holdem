import React, { useContext } from 'react'
import logic from '../../logic'
import Context from '../Context'
import { Link, withRouter } from 'react-router-dom'
import Feedback from '../Feedback'


function HostGame({ history }) {

    const { setGameId, feedback, setFeedback } = useContext(Context)

    function handleSubmit(event) {
        event.preventDefault()
        const { target: {
            name: { value: name },
            maxPlayers: { value: maxPlayers },
            initialStack: { value: initialStack },
            initialBB: { value: initialBB },
            initialSB: { value: initialSB },
            blindsIncrease: { value: blindsIncrease }
        } } = event

        handleHostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease)
    }

    async function handleHostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease) {
        try {
            const gameId = await logic.hostGame(name, maxPlayers, initialStack, initialBB, initialSB, blindsIncrease)
            setGameId(gameId)
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
                        <h2>Host Game</h2>
                    </div>
                    <form className="form" onSubmit={handleSubmit}>
                        <input className="form__input" type="text" name="name" placeholder="Game name..." />
                        <input className="form__input" type="text" name="maxPlayers" placeholder="Max players..." />
                        <input className="form__input" type="text" name="initialStack" placeholder="Initial stack..." />
                        <input className="form__input" type="text" name="initialBB" placeholder="Initial Big Blind..." />
                        <input className="form__input" type="text" name="initialSB" placeholder="Initial Small Blind..." />
                        <input className="form__input" type="text" name="blindsIncrease" placeholder="Blinds Increase..." />
                        <div className="card__buttons">
                            <button className="card__button submit">Submit</button>
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

export default withRouter(HostGame)