import React, { useState, useEffect } from 'react'
import { withRouter, Route } from 'react-router-dom'
import logic from '../logic'
import Context from './Context'
import Landing from './Landing'
import Home from './Home'
import Register from './Register'
import RegisterSuccess from './RegisterSuccess'
import Login from './Login'
import HostGame from './HostGame'
import JoinGame from './JoinGame'
import Table from './Table'

import '../styles/index.sass'

function App({ history }) {


	// States
	const [view, setView] = useState('landing')
	const [credentials, setCredentials] = useState(null)
	const [user, setUser] = useState(null)
	const [submitRegister, setSubmitRegister] = useState(null)
	const [gameId, setGameId] = useState(null)
	const [game, setGame] = useState(null)
	const [feedback, setFeedback] = useState(null)

	//On reset feedback on navigation
	useEffect(() => {
		setFeedback(null)
	}, [history.location])

	// Retrieve User
	useEffect(() => {
		if (logic.isUserLoggedIn()) {
			async function asyncRetrieveUser() {
				try {
					const userRetrieved = await logic.retrieveUser()
					setUser(userRetrieved)
					history.push('/home')
				} catch (error) {
					console.log(error.message)
				}
			}
			asyncRetrieveUser()
		}
	}, [credentials, history])


	// Retrieve Game
	useEffect(() => {
		if (logic.isUserInGame()) {
			async function asyncRetrieveGame() {
				try {
					const { game: gameRetrieved } = await logic.retrieveGame(logic.__gameId__)
					setGame(gameRetrieved)
					history.location.pathname !== '/table' && history.push('/table')
				} catch (error) {
					setFeedback(error.message)
				}
			}

			//asyncRetrieveGame()
			const interval = setInterval(function () { asyncRetrieveGame() }, 1000)

			// Component will mount
			return () => clearInterval(interval)
		}

	}, [logic.isUserInGame(), history])

	// If user exits the game by closing browser tab
	window.addEventListener("beforeunload", (event) =>  {
		event.preventDefault();
		async function leaveGameOnTabClose() {
			try {
				await logic.leaveGame(logic.__gameId__)
			} catch(error) {
				setFeedback(error.message)
			}
		}
		leaveGameOnTabClose()
	})

	return (
		<Context.Provider value={{
			view, setView, submitRegister, setSubmitRegister, user, setUser,
			gameId, setGameId, credentials, setCredentials, game, setGame,
			feedback, setFeedback
		}} >
			<Route exact path='/' render={() => logic.isUserLoggedIn() ? history.push('/home') : <Landing />} />
			<Route path='/home' render={() => logic.isUserLoggedIn() ? <Home /> : history.push('/')} />
			<Route path='/register' render={() => logic.isUserLoggedIn() ? history.push('/home') : <Register />} />
			<Route path='/register-success' render={() => submitRegister ? <RegisterSuccess /> : history.push('/register')} />
			<Route path='/login' render={() => logic.isUserLoggedIn() ? history.push('/home') : <Login />} />
			<Route path='/host-game' render={() => logic.isUserLoggedIn() ? <HostGame /> : history.push('/home')} />
			<Route path='/join-game' render={() => logic.isUserLoggedIn() ? <JoinGame /> : history.push('/home')} />
			<Route path='/table' render={() => logic.isUserLoggedIn() && logic.isUserInGame() ? <Table /> : history.push('/home')} />
		</Context.Provider>
	)
}

export default withRouter(App)