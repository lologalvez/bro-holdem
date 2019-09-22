import React, { useContext } from 'react'
import { withRouter } from 'react-router-dom'
import Context from '../Context'
import logic from '../../logic'
import Player from '../Player'
import Card from '../Card'
import ActionButtons from '../ActionButtons'
import Feedback from '../Feedback'
const REACT_APP_API_URL_PUBLIC = process.env.REACT_APP_API_URL_PUBLIC


function Table({ history }) {

    const { game, user, setGameId, feedback, setFeedback } = useContext(Context)

    async function handleStartGame() {
        if (logic.isUserInGame()) {
            try {
                await logic.dealHand(logic.__gameId__)
            } catch (error) {
                setFeedback(error.message)
            }
        }
    }

    async function handleLeaveGame() {
        if (logic.isUserInGame()) {
            try {
                await logic.leaveGame(logic.__gameId__)
                history.push('/home')
            } catch (error) {
                setFeedback(error.message)
            }
        }
    }

    return <>
        {game && user && logic.isUserInGame() ?
        <>
        <section class="poker__container">
            <div class="poker-header">
                <div className="poker-header__content">
                    <div className="poker-header__tableName">Game Name: {game.name}</div>
                    <div className="poker-header__gameId">Game ID: {logic.__gameId__}</div>
                </div>
                {feedback && <Feedback message={feedback}/>}
                <div className="poker-header__buttons">
                    {(game.host === user.id && game.status !== 'playing') && <button className="poker-header__button poker-header__button--start" onClick={handleStartGame}>Start game</button>}
                    <button className="poker-header__button poker-header__button--leave" onClick={handleLeaveGame}>Leave table</button>
                </div>
            </div>
            <div class="poker-table">
                {game.players.map(player => player && <Player player={player} hand={game.hands[game.hands.length - 1]} />)}
                {<img className="poker-table__image" src={`${REACT_APP_API_URL_PUBLIC}/images/table-nobg-svg-01.svg`} alt="Poker Table" />}
                <div className="poker-table__center">
                    <div className="poker-table__center--specs">
                        <div className="poker-table__center--pot">Pot: ${game.hands.length && game.hands[game.hands.length - 1].pot}</div>
                        <div className="poker-table__center--blinds">
                               <p className="poker-table__center--bb">BB: ${game.currentBB}</p>
                               <p className="poker-table__center--sb">SB: ${game.currentSB}</p>
                        </div>
                    </div>
                    <div className="poker-table__cards">
                    {game.hands.length > 0 && game.hands[game.hands.length - 1].tableCards.map(card => game.hands[game.hands.length - 1].round !== 0 ? 
                        <Card cardImage={card.image} /> 
                        : 
                        <Card cardImage={'/images/back.png'} />)}
                    </div>
                </div>
            </div>
        </section>
        <ActionButtons hand={game.hands[game.hands.length - 1]} game={game} user={user && user} />
        </>
        :
        setGameId(logic.__gameId__)
        }
    </>

}
export default withRouter(Table)
