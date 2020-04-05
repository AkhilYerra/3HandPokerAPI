const mongoose = require('mongoose')
const listOfUsersSchema = require('../schema/ListOfUsersSchema')
const playerSchema = require('../schema/playerSchema')
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
    for(let i =1; i < 14; i++){
        deckOfCards.push({suite:diamond, value:i})
    }
    for(let i =1; i < 14; i++){
        deckOfCards.push({suite:spade, value:i})
    }
    for(let i =1; i < 14; i++){
        deckOfCards.push({suite:clover, value:i})
    }
    for(let i =1; i < 14; i++){
        deckOfCards.push({suite:heart, value:i})
    }
    return deckOfCards;
}