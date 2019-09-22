import authenticateUser from './authenticate-user'
import registerUser from './register-user'
import retrieveUser from './retrieve-user'
import isUserLoggedIn from './is-user-logged-in'
import logUserOut from './log-user-out'
import isUserInGame from './is-user-in-game'
import hostGame from './host-game'
import joinGame from './join-game'
import retrieveGame from './retrieve-game'
import dealHand from './deal-hand'
import actionCall from './action-call'
import actionCheck from './action-check'
import actionFold from './action-fold'
import actionRaise from './action-raise'
import leaveGame from './leave-game'
import updateTurn from './update-turn'
import retrieveUserId from './retrieve-user-id'


export default {
    set __token__(token) {
        sessionStorage.token = token
    },
    get __token__() {
        return sessionStorage.token
    },
    set __gameId__(gameId) {
        sessionStorage.gameId = gameId
    },
    get __gameId__() {
        return sessionStorage.gameId
    },

    isUserLoggedIn,
    logUserOut,
    isUserInGame,
    registerUser,
    authenticateUser,
    retrieveUser,
    hostGame,
    joinGame,
    retrieveGame,
    dealHand,
    actionCall,
    actionCheck,
    actionFold,
    actionRaise,
    leaveGame,
    updateTurn,
    retrieveUserId
}