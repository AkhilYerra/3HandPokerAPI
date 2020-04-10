pokerController = require('../controller/pokerController')
pokerRouter = require('express').Router();

pokerRouter.get('/users', 
pokerController.getPlayers
)

pokerRouter.post('/addUser', 
pokerController.addPlayer
)

pokerRouter.get('/startGame', 
pokerController.startGame
)

pokerRouter.post('/startGame/initiatePlayers',
pokerController.populatePlayers
)

pokerRouter.get('/allPlayers', 
pokerController.getAllPlayers
)

pokerRouter.post('/shuffle', 
pokerController.shuffle
)

pokerRouter.post('/makeMove', 
pokerController.makeMove
)

pokerRouter.post('/payWinner', 
pokerController.payWinner)

pokerRouter.get('/getCards/:username',
pokerController.getCards);

pokerRouter.post('/getWinner/:firstUser/:secondUser?',
pokerController.getWinner);

module.exports = pokerRouter;