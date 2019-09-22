const { Router } = require('express')
const tokenMiddleware = require('../helpers/token-middleware')
const bodyParser = require('body-parser')

const { registerUser, authenticateUser, retrieveUser } = require('./user')
const { hostGame, joinGame, dealHand, retrieveGame, leaveGame, updateTurn } = require('./game')
const { call, check, fold, raise } = require('./action')

const router = Router()
const jsonBodyParser = bodyParser.json()


/* USER */
router.post('/users', jsonBodyParser, registerUser)
router.get('/users', [tokenMiddleware, jsonBodyParser], retrieveUser)
router.post('/auth', jsonBodyParser, authenticateUser)

/* GAME */
router.post('/games', [tokenMiddleware, jsonBodyParser], hostGame)
router.post('/games/:gameId', [tokenMiddleware, jsonBodyParser], joinGame)
router.get('/games/:gameId', [tokenMiddleware, jsonBodyParser], retrieveGame)
router.get('/games/:gameId/hands', [tokenMiddleware, jsonBodyParser], dealHand)
router.patch('/games/:gameId/players', [tokenMiddleware, jsonBodyParser], leaveGame)
router.post('/games/:gameId/turn', [tokenMiddleware, jsonBodyParser], updateTurn)
//router.post('/games/:gameId/hand', [tokenMiddleware, jsonBodyParser], newHand)

/* ACTION */
router.post('/games/:gameId/actions/call', [tokenMiddleware, jsonBodyParser], call)
router.post('/games/:gameId/actions/check', [tokenMiddleware, jsonBodyParser], check)
router.post('/games/:gameId/actions/fold', [tokenMiddleware, jsonBodyParser], fold)
router.post('/games/:gameId/actions/raise', [tokenMiddleware, jsonBodyParser], raise)

module.exports = router