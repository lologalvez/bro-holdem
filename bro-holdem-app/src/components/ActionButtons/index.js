import React, { useState, useContext } from 'react'
import Context from '../Context'
import logic from '../../logic'

function ActionButtons({ hand, game, user }) {

    const [bet, setBet] = useState(0)

    const { setFeedback } = useContext(Context)


    async function handleCall() {
        try {
            await logic.actionCall(logic.__gameId__)
            const { stage } = await logic.updateTurn(logic.__gameId__)
            if (stage === 'Hand') await logic.dealHand(logic.__gameId__)
            setFeedback(null)
            setBet('')
        } catch (error) {
            setFeedback(error.message)
        }
    }

    async function handleCheck() {
        try {
            await logic.actionCheck(logic.__gameId__)
            const { stage } = await logic.updateTurn(logic.__gameId__)
            if (stage === 'Hand') await logic.dealHand(logic.__gameId__)
            setFeedback(null)
            setBet('')
        } catch (error) {
            setFeedback(error.message)
        }
    }

    function handleSubmitAmount(event) {
        event.preventDefault()
        const { target: { raiseAmount: { value: raiseAmount } } } = event
        handleRaise(raiseAmount)
    }

    async function handleRaise(raiseAmount) {
        try {
            await logic.actionRaise(logic.__gameId__, raiseAmount)
            const { stage } = await logic.updateTurn(logic.__gameId__)
            if (stage === 'Hand') await logic.dealHand(logic.__gameId__)
            setFeedback(null)
            setBet('')
        } catch (error) {
            setFeedback(error.message)
        }

    }

    async function handleFold() {
        try {
            await logic.actionFold(logic.__gameId__)
            const { stage } = await logic.updateTurn(logic.__gameId__)
            if (stage === 'Hand') await logic.dealHand(logic.__gameId__)
            setFeedback(null)
            setBet('')
        } catch (error) {
            setFeedback(error.message)
        }
    }

    function handle2BB() {
        setFeedback(null)
        if (hand) setBet(game.currentBB * 2)
    }

    function handle4BB() {
        setFeedback(null)
        if (hand) setBet(game.currentBB * 4)
    }

    function handleAllIn() {
        setFeedback(null)
        if (hand) {
            const player = game.players.find(player => player.user.id === user.id)
            if (player) setBet(player.currentStack)
        }
    }

    function handleOnInputChange(event) {
         setBet(event.target.value)
    }

    return <div className="button__container">
            <section className="button-action__container">
                <button className="button-action__btn" onClick={handleCall}>Call</button>
                <button className="button-action__btn" onClick={handleCheck}>Check</button>
                <button className="button-action__btn" onClick={handleFold}>Fold</button>
                <button className="button-action__btn" form="raise-form">Raise</button>
            </section>
            <section className="button-blind__container">
                <form id="raise-form" onSubmit={handleSubmitAmount}>
                    <input onChange={handleOnInputChange} className="button-action__input" type="text" name="raiseAmount" value={bet ? bet : ''}></input>
                </form>
                <button className="button-blind__btn" onClick={handle2BB}>2BB</button>
                <button className="button-blind__btn" onClick={handle4BB}>4BB</button>
                <button className="button-blind__btn" onClick={handleAllIn}>All in</button>
            </section>
        </div>
}

export default ActionButtons
