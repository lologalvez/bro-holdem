import React, { useContext } from 'react'
import Context from '../Context'
import logic from '../../logic'

function TableCards({ cardImage }) {

    const { game } = useContext(Context)

    return <>
        {game.hands[game.hands.length - 1].tableCards.map(card => { <span><img src={game.hands[game.hands.length - 1].round > 0 ? cardImage : "/images/back.png"}></img></span> }
        )}
    </>
}

export default TableCards
