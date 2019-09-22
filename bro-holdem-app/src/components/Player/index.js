import React from 'react'
import logic from '../../logic'
import Card from '../Card'
const REACT_APP_API_URL_PUBLIC = process.env.REACT_APP_API_URL_PUBLIC

function Player({ player, hand }) {
    return <>
        {player &&
            <>
            <div className={`player player-position__${player.position}`}>
            {player.cards.length > 0 &&
                <div className="player-info__cards">
                    {player.cards.map(card =>
                        logic.retrieveUserId() === player.user.id ? <Card cardImage={card.image} /> : <Card cardImage={'/images/back.png'} />
                    )}
                </div>
                }
                <div class={`player-details player-details--${(hand && hand.turnPos === player.position) ? 'active' : 'inactive' }`}>
                    <div className="player-avatar">
                        <img alt="avatar" className="player-avatar__img" src={player.user.avatar ? `${REACT_APP_API_URL_PUBLIC}${player.user.avatar}`: `${REACT_APP_API_URL_PUBLIC}/images/default-avatar.png`} width="60" height="50" />
                    </div>
                    <div className="player-info">
                        <div className="player-info__username">{player.user.username}</div>
                        <div className="player-info__stack">${player.currentStack}</div>
                        {hand && hand.dealerPos === player.position && <div className="player-info__dealer">Dealer</div>}
                        {hand && hand.bbPos === player.position && <div className="player-info__bb">BB</div>}
                        {hand && hand.sbPos === player.position && <div className="player-info__sb">SB</div>}
                    </div>
                </div>
                <div className={`player-info__current-bet player-info__current-bet--${(hand && hand.turnPos === player.position) ? 'active' : 'inactive'}`}>Bet: ${player.betAmount}</div>
            </div>
            </>
        }
    </>
}

export default Player
