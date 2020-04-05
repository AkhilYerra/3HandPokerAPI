const mongoose = require('mongoose')
const listOfUsersSchema = require('../schema/ListOfUsersSchema')
const playerSchema = require('../schema/playerSchema')
const playerListSchema = require('../schema/playerListSchema')
const Card = require('../model/card')


exports.addPlayerToMongo = async ([userNameToAdd, pusher]) =>{
    let results = await listOfUsersSchema.findOneAndUpdate(
        { "type": 'ListOfPlayers' },
        { "$addToSet": { "users": userNameToAdd } },
        { returnOriginal: false, useFindAndModify:false , new:true},
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

exports.shuffleCards = async([listOfUsers]) =>{
    console.log("SHUFFLING")
    console.log(listOfUsers)
    let fullDeck = createDeckOfCards();
    for(let i =0; i < listOfUsers.length; i++){
        let arrayOfCards = [];
        let randomCard1 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        let randomCard2 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        let randomCard3 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        arrayOfCards.push(randomCard1);
        arrayOfCards.push(randomCard2);
        arrayOfCards.push(randomCard3);
        await playerSchema.findOneAndUpdate({'name':listOfUsers[i]}, {'$set': {'cards' : arrayOfCards}},
        function(error, properties){
            if(error){
                return error;
            }
        });     
    }
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

exports.changeTurn = async([moveDetails]) =>{
    let username = moveDetails.username;
    let hasFolded = moveDetails.hasFolded;
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
        console.log(results[0].list);
        console.log(index);
        await playerListSchema.findOneAndUpdate({'name':'PlayerList'}, {'$set': {'list' : results[0].list}},{upsert: true},
        function(error, properties){
            if(error){
                return error;
            }
        }); 
        if(index >= results[0].list.length){
            index = 0;
        }
        let username = results[0].list[index];
        console.log(username)
        await playerSchema.findOneAndUpdate({'name':username}, {'$set': {'isYourTurn': true}},
        function(error, properties){
            if(error){
                return error;
            }
            console.log("FINSIHED");
        });   
     }else{
        index = index + 1;
        if(index >= results[0].list.length){
            index = 0;
        }
        let username = results[0].list[index];
        console.log(username)
        await playerSchema.findOneAndUpdate({'name':username}, {'$set': {'isYourTurn': true}},
        function(error, properties){
            if(error){
                return error;
            }
            console.log("FINSIHED");
        });     
     }
     return null;
}

