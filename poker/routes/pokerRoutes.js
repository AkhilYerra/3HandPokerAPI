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

module.exports = pokerRouter;