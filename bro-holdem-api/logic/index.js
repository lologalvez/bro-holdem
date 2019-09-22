module.exports = {
    registerUser: require('./user/register-user'),
    authenticateUser: require('./user/authenticate-user'),
    retrieveUser: require('./user/retrieve-user'),
    unregisterUser: require('./user/unregister-user'),
    updateUser: require('./user/update-user'),
    hostGame: require('./game/host-game'),
    joinGame: require('./game/join-game'),
    dealHand: require('./game/deal-hand'),
    retrieveGame: require('./game/retrieve-game'),
    leaveGame: require('./game/leave-game'),
    call: require('./action/call'),
    check: require('./action/check'),
    fold: require('./action/fold'),
    raise: require('./action/raise'),
    updateTurn: require('./game/update-turn'),
    resolveHand: require('./game/resolve-hand')
}
