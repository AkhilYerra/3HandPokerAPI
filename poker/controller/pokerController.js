exports.addPlayer = (req, res, next) =>{
    playerToBeAdded = req.body.playerName;
    res.status(200).end(playerToBeAdded);
}

exports.testsample = (req, res, next) =>{
    console.log("HOLD UP WAIT");
    res.status(200).end('pop')
    next('We Gucci');
}