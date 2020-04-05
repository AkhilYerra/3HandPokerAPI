const pokerService = require('../service/pokerService')
var Pusher = require('pusher');


let pusher = new Pusher({
    appId: '971535',
    key: '4edf52a5d834ee8fe586',
    secret: 'f25e8145d1d04dabe954',
    cluster: 'us2',
    useTLS: true
  });
exports.addPlayer = async (req, res, next) =>{
    playerToBeAdded = req.body.playerName;
    let username = {userName: playerToBeAdded};
    try{
        const result = await pokerService.addPlayerToMongo([playerToBeAdded,pusher]);
        res.send(result.users);
    }catch(err){
        next(err);
    }
}

exports.getPlayers = async (req, res, next) =>{
    try{
        const result = await pokerService.retrieveUserList([pusher]);
        res.send(result.users);
    }catch(err){
        next(err);
    }
}

exports.startGame = async(req, res, next) =>{
    try{
        const result = await pokerService.startGame([pusher]);
        res.send(result);
    }catch(err){
        next(err)
    }
}


exports.populatePlayers = async(req, res, next)=>{
    playerToBeAdded = req.body.playerName;
    betAmount = req.body.amount;
    let samplePlayer = {
        name : playerToBeAdded,
        amount:betAmount,
        hasSeen: false,
        hasFolded:false,
        isYourTurn: (playerToBeAdded==='Admin' ? true : false),
        cards:[],
    }
    try{
        const result = await pokerService.populatePlayersForGame([samplePlayer]);
        res.send(result);
    }catch(err){
        next(err)
    }
}

exports.getAllPlayers = async(req, res, next) =>{
    try{
        const result = await pokerService.getAllPlayers([pusher]);
        console.log(result);
        res.send(result);
    }catch(err){
        next(err)
    }
}

exports.shuffle = async(req, res, next) =>{
    listOfUsers = req.body;
    console.log(listOfUsers)
    try{
        await pokerService.shuffleCards([listOfUsers]);
        try{
            await pokerService.updatePlayersPlaying([listOfUsers]);
            try{
                const allPlayers = await pokerService.getAllPlayers([pusher]);
                console.log(allPlayers)
                res.send(allPlayers);
            }catch(error){
                next(error)
            }    
        }catch(e){
            next(e);
        }
        console.log(allPlayers);
        res.send(allPlayers);
    }catch(err){
        next(err)
    }
}

exports.makeMove = async(req, res, next) =>{
    let moveDetails = req.body;
    try{
        await pokerService.makeMove([moveDetails]);
        try{
            const list = await pokerService.changeTurn([moveDetails]);
            try{
                const allPlayers = await pokerService.getAllPlayers([pusher]);
                console.log(allPlayers)
                res.send(allPlayers);
            }catch(error){
                next(error)
            }    
        }catch(e){

        }
        console.log(allPlayers);
        res.send(allPlayers);
    }catch(err){
        next(err)
    }
}