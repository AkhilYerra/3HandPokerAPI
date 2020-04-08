const mongoose = require('mongoose')
const listOfUsersSchema = require('../schema/ListOfUsersSchema')
const playerSchema = require('../schema/playerSchema')
const playerListSchema = require('../schema/playerListSchema')
const Card = require('../model/card')
const gameStatusSchema = require('../schema/gameStatusSchema')


exports.addPlayerToMongo = async ([userNameToAdd, pusher]) =>{
    console.log("ADDING PLAYER");
    try{
        let results = await listOfUsersSchema.findOneAndUpdate(
            { "type": 'ListOfPlayers' },
            { "$addToSet": { "users": userNameToAdd } },
            { returnOriginal: false, useFindAndModify:false , new:true, upsert:true},
         );
         pusher.trigger('3HandPoker', 'retrieveUserList', {
            'arrayOfUsers': results.users,
          });    
          return(null, results);
    }catch(error){
        return(error);
    }
     
}

exports.retrieveUserList = async ([pusher]) =>{
    let results = await listOfUsersSchema.findOne(
        { "type": 'ListOfPlayers' },
        function (err, raw) {
            if (err){
                return err;
            }
            pusher.trigger('3HandPoker', 'retrieveUserList', {
                'arrayOfUsers': raw.users,
              });
        }
     );
     return(null, results);     
}

exports.startGame = async ([pusher]) => {
    pusher.trigger('3HandPoker', 'startGame', {
        'hasGameStarted': true,
    });
    console.log("START")
    return (null, 'SUCCESS');
}

exports.populatePlayersForGame = async ([samplePlayer]) => {
    // console.log("YEAAHHHH")
    let results = await playerSchema.create(
        samplePlayer,
        function (err, raw) {
            if (err){
                return err;
            }
            return(null, raw.toObject())

        }
     )
     return(null, results);  
}

exports.getAllPlayers = async([pusher]) =>{
    console.log("GETTING")
    let results = await playerSchema.find(
        {},
        function (err, raw) {
            if (err){
                return err;
            }
        }
     );
     let AllPlayers = {};
     for(let i = 0; i < results.length; i++){
        AllPlayers[results[i].name] = results[i];
     }
     console.log(AllPlayers);
     pusher.trigger('3HandPoker', 'getAllPlayers', {
                'AllPlayers': AllPlayers,
              });
     return(null, AllPlayers);  
}

exports.updatePlayersPlaying = async([listOfUsers]) =>{
    playerListSchema.findOneAndUpdate({'name':'PlayerList'}, {'$set': {'list' : listOfUsers}},{upsert: true},
        function(error, properties){
            if(error){
                return error;
            }
        });     
}

exports.shuffleCards = async([listOfUsers, pusher]) =>{
    console.log("SHUFFLING")
    console.log(listOfUsers.length)
    let fullDeck = createDeckOfCards();
    for(let i =0; i < listOfUsers.length; i++){
        let arrayOfCards = [];
        let randomCard1 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        let randomCard2 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        let randomCard3 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        arrayOfCards.push(randomCard1);
        arrayOfCards.push(randomCard2);
        arrayOfCards.push(randomCard3);
        let yourTurn = false;
        if(listOfUsers[i] === 'Admin'){
            yourTurn = true;
        }
        await playerSchema.findOneAndUpdate({'name':listOfUsers[i]}, {'$set': {'cards' : arrayOfCards, 'hasSeen':false, 'hasFolded':false, 'isYourTurn':yourTurn}},
        function(error, properties){
            if(error){
                return error;
            }
        });     
    }
    await gameStatusSchema.findOneAndUpdate({'gameId':'Uno3Hand'}, {'$set': {'playersRemaining' : listOfUsers.length, 'pot':0.00, 'blindAmount':1, 'seenAmount':1, 'playersInRound':listOfUsers}},{upsert: true, returnOriginal: false, useFindAndModify:false , new:true},
        function(error, raw){
            if(error){
                return error;
            }
            let sampleObj = {
                gameId:raw.gameId,
                playersRemaining:raw.playersRemaining,
                playersInRound:raw.playersInRound,
                pot: raw.pot,
                blindAmount: raw.blindAmount,
                seenAmount:raw.seenAmount 
            }
            console.log(sampleObj)

            pusher.trigger('3HandPoker', 'retrieveGameState', sampleObj);
        });
    return null;
}

function createDeckOfCards(){
    const diamond = 'Diamond'
    const spade = 'Spade'
    const clover = 'Clover'
    const heart = 'Heart'
    let deckOfCards = [];
    for(let i =7; i < 15; i++){
        deckOfCards.push({suite:diamond, value:i})
    }
    for(let i =7; i < 15; i++){
        deckOfCards.push({suite:spade, value:i})
    }
    for(let i =7; i < 15; i++){
        deckOfCards.push({suite:clover, value:i})
    }
    for(let i =7; i < 15; i++){
        deckOfCards.push({suite:heart, value:i})
    }
    return deckOfCards;
}

exports.makeMove = async([moveDetails]) =>{
    let username = moveDetails.username;
    let hasSeen = moveDetails.hasSeen;
    let hasFolded = moveDetails.hasFolded;
    let amount = moveDetails.amount;
    let userAmount = moveDetails.userAmount;
    let updatedAmount = userAmount - amount;
    await playerSchema.findOneAndUpdate({'name':username}, {'$set': {'hasSeen': hasSeen, 'hasFolded':hasFolded, 'amount' : updatedAmount, 'isYourTurn': false}},
    function(error, properties){
        if(error){
            return error;
        }
        console.log("FINSIHED");
    }); 
    return null;
}

exports.changeTurn = async([moveDetails, pusher]) =>{
    console.log("CHANGINS")
    let username = moveDetails.username;
    let hasSeen = moveDetails.hasSeen;
    let hasFolded = moveDetails.hasFolded;
    let amount = moveDetails.amount;
    let userAmount = moveDetails.userAmount;
    let updatedAmount = userAmount - amount;
    let results = await playerListSchema.find(
        {},
        function (err, raw) {
            if (err){
                return err;
            }
        }
     );
     let index = 0;
     for(let i =0; i < results[0].list.length; i++){
        if(results[0].list[i] === username){
            index = i;
        }
     }
     if(hasFolded === true){
        results[0].list.splice(index, 1);
        await playerListSchema.findOneAndUpdate({'name':'PlayerList'}, {'$set': {'list' : results[0].list}},{returnOriginal: false, useFindAndModify:false , new:true},
        function(error, properties){
            if(error){
                return error;
            }
        }); 
        if(index >= results[0].list.length){
            index = 0;
        }
        let username = results[0].list[index];
        await playerSchema.findOneAndUpdate({'name':username}, {'$set': {'isYourTurn': true}},
        function(error, properties){
            if(error){
                return error;
            }
        });           
     }else{
        index = index + 1;
        if(index >= results[0].list.length){
            index = 0;
        }
        let username = results[0].list[index];
        await playerSchema.findOneAndUpdate({'name':username}, {'$set': {'isYourTurn': true}},
        function(error, properties){
            if(error){
                return error;
            }
        });     
     }
     let gameStatusRecent = await gameStatusSchema.findOne({'gameId':'Uno3Hand'});
     let newBlindAmount = 1;
     let newSeenAmount = 1;
     if(hasSeen === true){
        newSeenAmount = amount/0.25;
        newBlindAmount = gameStatusRecent.blindAmount;
     }else if(hasSeen === false){
         newBlindAmount = amount/0.25;
         newSeenAmount = newBlindAmount * 2;
     }
     let newPot = Number(gameStatusRecent.pot.toString()) + amount;
     await gameStatusSchema.findOneAndUpdate({'gameId':'Uno3Hand'}, {'$set': {'playersRemaining' : results[0].list.length, 'blindAmount':newBlindAmount, 'seenAmount':newSeenAmount, 'pot':newPot, 'playersInRound':results[0].list}},{returnOriginal: false, useFindAndModify:false , new:true},
     function(error, raw){
         if(error){
             return error;
         }
         let sampleObj = {
             gameId:raw.gameId,
             playersRemaining:raw.playersRemaining,
             playersInRound:raw.playersInRound,
             pot: raw.pot,
             blindAmount: raw.blindAmount,
             seenAmount:raw.seenAmount 
         }
         pusher.trigger('3HandPoker', 'retrieveGameState',
             sampleObj);
     });
     if(results[0].list.length === 1){

     }
     return null;
}

exports.payWinner = async([winnerDetails]) =>{
    console.log("WINNER PAID");
    let username = winnerDetails.username;
    let potAmount = winnerDetails.potAmount;
    console.log(`This much pot : ${potAmount}`)
    try{
        let update = await playerSchema.findOneAndUpdate({'name':username}, {'$inc': {'amount' : potAmount}},{useFindAndModify:false}); 
        return update;
    }catch(error){
        console.log(error);
        return error;
    }
    return update;
}
