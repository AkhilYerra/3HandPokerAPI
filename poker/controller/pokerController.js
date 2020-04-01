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
        console.log(result)
        res.send(result.users);
    }catch(err){
        next(err);
    }
}

exports.testsample = (req, res, next) =>{
    console.log("HOLD UP WAIT");
    res.status(200).end('pop')
    next('We Gucci');
}