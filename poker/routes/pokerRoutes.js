pokerController = require('../controller/pokerController')
pokerRouter = require('express').Router();

pokerRouter.get('/poker', 
pokerController.testsample
)

pokerRouter.post('/addUser', 
pokerController.addPlayer
)

module.exports = pokerRouter;