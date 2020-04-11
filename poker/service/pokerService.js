const mongoose = require('mongoose')
const listOfUsersSchema = require('../schema/ListOfUsersSchema')
const playerSchema = require('../schema/playerSchema')
const playerListSchema = require('../schema/playerListSchema')
const Card = require('../model/card')
const gameStatusSchema = require('../schema/gameStatusSchema')
const _ = require('lodash');
const winOrder = [
    'STRAIGHT_FLUSH',
    'THREE_OF_A_KIND',
    'STRAIGHT',
    'FLUSH',
    'PAIR',
    'HIGH_CARD'
]
const winningHands = {
    STRAIGHT_FLUSH: 'STRAIGHT_FLUSH',
    THREE_OF_A_KIND: 'THREE_OF_A_KIND',
    STRAIGHT: 'STRAIGHT',
    FLUSH: 'FLUSH',
    PAIR: 'PAIR',
    HIGH_CARD: 'HIGH_CARD'
}
  

exports.addPlayerToMongo = async ([userNameToAdd, pusher]) => {
    //console.log("ADDING PLAYER");
    try {
        let results = await listOfUsersSchema.findOneAndUpdate(
            { "type": 'ListOfPlayers' },
            { "$addToSet": { "users": userNameToAdd } },
            { returnOriginal: false, useFindAndModify: false, new: true, upsert: true },
        );
        pusher.trigger('3HandPoker', 'retrieveUserList', {
            'arrayOfUsers': results.users,
        });
        return (null, results);
    } catch (error) {
        return (error);
    }

}

exports.retrieveUserList = async ([pusher]) => {
    let results = await listOfUsersSchema.findOne(
        { "type": 'ListOfPlayers' },
        function (err, raw) {
            if (err) {
                return err;
            }
            if(!_.isUndefined(raw.users)){
                pusher.trigger('3HandPoker', 'retrieveUserList', {
                    'arrayOfUsers': raw.users,
                });    
            }
        }
    );
    return (null, results);
}

exports.startGame = async ([pusher]) => {
    pusher.trigger('3HandPoker', 'startGame', {
        'hasGameStarted': true,
    });
    //console.log("START")
    return (null, 'SUCCESS');
}

exports.populatePlayersForGame = async ([samplePlayer]) => {
    let results = await playerSchema.create(
        samplePlayer,
        function (err, raw) {
            if (err) {
                return err;
            }
            return (null, raw.toObject())

        }
    )
    return (null, results);
}

exports.getAllPlayers = async ([pusher]) => {
    //console.log("GETTING")
    let results = await playerSchema.find(
        {},
        function (err, raw) {
            if (err) {
                return err;
            }
        }
    );
    let AllPlayers = {};
    for (let i = 0; i < results.length; i++) {
        AllPlayers[results[i].name] = results[i];
    }
    pusher.trigger('3HandPoker', 'getAllPlayers', {
        'AllPlayers': AllPlayers,
    });
    return (null, AllPlayers);
}

exports.updatePlayersPlaying = async ([listOfUsers]) => {
    playerListSchema.findOneAndUpdate({ 'name': 'PlayerList' }, { '$set': { 'list': listOfUsers } }, { upsert: true },
        function (error, properties) {
            if (error) {
                return error;
            }
        });
}

exports.shuffleCards = async ([listOfUsers, pusher]) => {
    //console.log("SHUFFLING")
    //console.log(listOfUsers.length)
    let fullDeck = createDeckOfCards();
    for (let i = 0; i < listOfUsers.length; i++) {
        let arrayOfCards = [];
        let randomCard1 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        let randomCard2 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        let randomCard3 = fullDeck.splice(Math.floor(Math.random() * fullDeck.length), 1)[0]
        arrayOfCards.push(randomCard1);
        arrayOfCards.push(randomCard2);
        arrayOfCards.push(randomCard3);
        let yourTurn = false;
        if (listOfUsers[i] === 'Admin') {
            yourTurn = true;
        }
        await playerSchema.findOneAndUpdate({ 'name': listOfUsers[i] }, { '$set': { 'cards': arrayOfCards, 'hasSeen': false, 'hasFolded': false, 'isYourTurn': yourTurn } },
            function (error, properties) {
                if (error) {
                    return error;
                }
            });
    }
    await gameStatusSchema.findOneAndUpdate({ 'gameId': 'Uno3Hand' }, { '$set': { 'playersRemaining': listOfUsers.length, 'pot': 0.00, 'blindAmount': 1, 'seenAmount': 1, 'playersInRound': listOfUsers,'hasWinner':false,'gameEnded':false } }, { upsert: true, returnOriginal: false, useFindAndModify: false, new: true },
        function (error, raw) {
            if (error) {
                return error;
            }
            let sampleObj = {
                gameId: raw.gameId,
                playersRemaining: raw.playersRemaining,
                playersInRound: raw.playersInRound,
                pot: raw.pot,
                blindAmount: raw.blindAmount,
                seenAmount: raw.seenAmount,
                hasWinner: false, 
                gameEnded: false
            }
            //console.log(sampleObj)

            pusher.trigger('3HandPoker', 'retrieveGameState', sampleObj);
        });
    return null;
}

function createDeckOfCards() {
    const diamond = 'Diamond'
    const spade = 'Spade'
    const clover = 'Clover'
    const heart = 'Heart'
    let deckOfCards = [];
    for (let i = 7; i < 15; i++) {
        deckOfCards.push({ suite: diamond, value: i })
    }
    for (let i = 7; i < 15; i++) {
        deckOfCards.push({ suite: spade, value: i })
    }
    for (let i = 7; i < 15; i++) {
        deckOfCards.push({ suite: clover, value: i })
    }
    for (let i = 7; i < 15; i++) {
        deckOfCards.push({ suite: heart, value: i })
    }
    return deckOfCards;
}

exports.makeMove = async ([moveDetails]) => {
    let username = moveDetails.username;
    let hasSeen = moveDetails.hasSeen;
    let hasFolded = moveDetails.hasFolded;
    let amount = moveDetails.amount;
    let userAmount = moveDetails.userAmount;
    let updatedAmount = userAmount - amount;
    await playerSchema.findOneAndUpdate({ 'name': username }, { '$set': { 'hasSeen': hasSeen, 'hasFolded': hasFolded, 'amount': updatedAmount, 'isYourTurn': false } },
        function (error, properties) {
            if (error) {
                return error;
            }
            //console.log("FINSIHED");
        });
    return null;
}

exports.changeTurn = async ([moveDetails, pusher]) => {
    //console.log("CHANGINS")
    let username = moveDetails.username;
    let hasSeen = moveDetails.hasSeen;
    let hasFolded = moveDetails.hasFolded;
    let amount = moveDetails.amount;
    let userAmount = moveDetails.userAmount;
    let updatedAmount = userAmount - amount;
    let results = await playerListSchema.find(
        {},
        function (err, raw) {
            if (err) {
                return err;
            }
        }
    );
    let index = 0;
    for (let i = 0; i < results[0].list.length; i++) {
        if (results[0].list[i] === username) {
            index = i;
        }
    }
    if (hasFolded === true) {
        results[0].list.splice(index, 1);
        //Remove User from Game Status List
        await playerListSchema.findOneAndUpdate({ 'name': 'PlayerList' }, { '$set': { 'list': results[0].list } }, { returnOriginal: false, useFindAndModify: false, new: true },
            function (error, properties) {
                if (error) {
                    return error;
                }
            });
        if (index >= results[0].list.length) {
            index = 0;
        }
        let username = results[0].list[index];
        //Set Turn To Next Player
        await playerSchema.findOneAndUpdate({ 'name': username }, { '$set': { 'isYourTurn': true } },
            function (error, properties) {
                if (error) {
                    return error;
                }
            });
    } else {
        index = index + 1;
        if (index >= results[0].list.length) {
            index = 0;
        }
        let username = results[0].list[index];
        await playerSchema.findOneAndUpdate({ 'name': username }, { '$set': { 'isYourTurn': true } },
            function (error, properties) {
                if (error) {
                    return error;
                }
            });
    }
    let gameStatusRecent = await gameStatusSchema.findOne({ 'gameId': 'Uno3Hand' });
    let newBlindAmount = 1;
    let newSeenAmount = 1;
    if (hasSeen === true) {
        newSeenAmount = amount / 0.25;
        newBlindAmount = gameStatusRecent.blindAmount;
    } else if (hasSeen === false) {
        newBlindAmount = amount / 0.25;
        newSeenAmount = newBlindAmount * 2;
    }
    let newPot = Number(gameStatusRecent.pot.toString()) + amount;
    await gameStatusSchema.findOneAndUpdate({ 'gameId': 'Uno3Hand' }, { '$set': { 'playersRemaining': results[0].list.length, 'blindAmount': newBlindAmount, 'seenAmount': newSeenAmount, 'pot': newPot, 'playersInRound': results[0].list } }, { returnOriginal: false, useFindAndModify: false, new: true },
        function (error, raw) {
            if (error) {
                return error;
            }
            let sampleObj = {
                gameId: raw.gameId,
                playersRemaining: raw.playersRemaining,
                playersInRound: raw.playersInRound,
                pot: raw.pot,
                blindAmount: raw.blindAmount,
                seenAmount: raw.seenAmount,
                hasWinner: false,
                gameEnded:false

            }
            pusher.trigger('3HandPoker', 'retrieveGameState',
                sampleObj);
        });
    if (results[0].list.length === 1) {

    }
    return null;
}

exports.payWinner = async ([winnerDetails]) => {
    //console.log("WINNER PAID");
    let username = winnerDetails.username;
    let potAmount = winnerDetails.potAmount;
    //console.log(`This much pot : ${potAmount}`)
    try {
        let update = await playerSchema.findOneAndUpdate({ 'name': username }, { '$inc': { 'amount': potAmount } }, { useFindAndModify: false });
        return update;
    } catch (error) {
        //console.log(error);
        return error;
    }
    return update;
}

exports.getCards = async ([username]) => {
    //console.log("GETTING CARDS");
    //console.log(username)
    try {
        let cards = await playerSchema.findOne({ 'name': username }).select('cards');
        //console.log(cards);
        return cards;
    } catch (error) {
        //console.log(error);
        return error;
    }
    return cards;
}

exports.getWinner = async ([firstUser, secondUser, userWhoPressedShow, amount, playerAmount, pusher]) => {
    let cardsOfFirstPlayer = await this.getCards([firstUser]);
    let cardsOfSecondPlayer = await this.getCards([secondUser]);
    cardsOfFirstPlayer = cardsOfFirstPlayer.cards;
    cardsOfSecondPlayer = cardsOfSecondPlayer.cards
    let firstPlayerHand = this.findHand([cardsOfFirstPlayer]);
    let secondPlayerHand = this.findHand([cardsOfSecondPlayer]);
    let winnerFromMethod = this.passBackWinner([firstPlayerHand, secondPlayerHand, firstUser, secondUser]);
    let reducedAmount = playerAmount - amount;
    await playerSchema.findOneAndUpdate({ 'name': userWhoPressedShow }, { '$set': {'amount': reducedAmount} });
    let gameStatusRecent = await gameStatusSchema.findOne({ 'gameId': 'Uno3Hand' });
    let oldPot = Number(gameStatusRecent.pot.toString());
    let newPot = oldPot + Number(amount);
    if (winnerFromMethod.both === true) {
        if (userWhoPressedShow === firstUser) {
            let winnerDetails = {
                firstPersonDetails: {
                    cards: cardsOfFirstPlayer,
                    hand: firstPlayerHand.hand,
                    username: firstUser,
                },
                secondPersonDetails: {
                    cards: cardsOfSecondPlayer,
                    hand: secondPlayerHand.hand,
                    username: secondUser
                },
                winner: secondUser
            }
            //console.log(winnerDetails)
            pusher.trigger('3HandPoker', 'getWinner',
        winnerDetails);
        await gameStatusSchema.findOneAndUpdate({ 'gameId': 'Uno3Hand' }, { '$set': { 'pot':newPot,'hasWinner':true } }, { returnOriginal: false, useFindAndModify: false, new: true },
        function (error, raw) {
            if (error) {
                return error;
            }
            let sampleObj = {
                gameId: raw.gameId,
                playersRemaining: raw.playersRemaining,
                playersInRound: raw.playersInRound,
                pot: raw.pot,
                blindAmount: raw.blindAmount,
                seenAmount: raw.seenAmount, 
                hasWinner: true,
                gameEnded:false
            }
            //console.log(sampleObj)

            let details = {username:winnerDetails.winner,potAmount:sampleObj.pot}
            playerSchema.findOneAndUpdate({ 'name': details.username }, { $inc: { 'amount': newPot } }, { returnOriginal: false, useFindAndModify: false, new: true }, function(err, success){
                if(err){
                    return err;
                }
                console.log(success)
                console.log(Number(success.amount.toString()))
                pusher.trigger('3HandPoker', 'retrieveGameState', sampleObj);
                return winnerDetails;
            });
        });

        } else {
            let winnerDetails = {
                firstPersonDetails: {
                    cards: cardsOfFirstPlayer,
                    hand: firstPlayerHand.hand,
                    username: firstUser,
                },
                secondPersonDetails: {
                    cards: cardsOfSecondPlayer,
                    hand: secondPlayerHand.hand,
                    username: secondUser
                },
                winner: firstUser
            }
            //console.log(winnerDetails)
            pusher.trigger('3HandPoker', 'getWinner',
        winnerDetails);
        await gameStatusSchema.findOneAndUpdate({ 'gameId': 'Uno3Hand' }, { '$set': { 'pot':newPot,'hasWinner':true } }, { returnOriginal: false, useFindAndModify: false, new: true },
        function (error, raw) {
            if (error) {
                return error;
            }
            let sampleObj = {
                gameId: raw.gameId,
                playersRemaining: raw.playersRemaining,
                playersInRound: raw.playersInRound,
                pot: raw.pot,
                blindAmount: raw.blindAmount,
                seenAmount: raw.seenAmount, 
                hasWinner: true,
                gameEnded:false
            }
            //console.log(sampleObj)
            let details = {username:winnerDetails.winner,potAmount:sampleObj.pot}
            playerSchema.findOneAndUpdate({ 'name': details.username }, { $inc: { 'amount': newPot } }, { returnOriginal: false, useFindAndModify: false, new: true }, function(err, success){
                if(err){
                    return err;
                }
                console.log(success)
                console.log(Number(success.amount.toString()))
                pusher.trigger('3HandPoker', 'retrieveGameState', sampleObj);
                return winnerDetails;
            });
        });

            // return winnerDetails;
        }
    } else {
        let winnerDetails = {
            firstPersonDetails: {
                cards: cardsOfFirstPlayer,
                hand: firstPlayerHand.hand,
                username: firstUser,
            },
            secondPersonDetails: {
                cards: cardsOfSecondPlayer,
                hand: secondPlayerHand.hand,
                username: secondUser
            },
            winner: winnerFromMethod.user
        }
        pusher.trigger('3HandPoker', 'getWinner',
        winnerDetails);
        //console.log(winnerDetails)
        await gameStatusSchema.findOneAndUpdate({ 'gameId': 'Uno3Hand' }, { '$set': { 'pot':newPot,'hasWinner':true } }, { returnOriginal: false, useFindAndModify: false, new: true },
        function (error, raw) {
            if (error) {
                return error;
            }
            let sampleObj = {
                gameId: raw.gameId,
                playersRemaining: raw.playersRemaining,
                playersInRound: raw.playersInRound,
                pot: raw.pot,
                blindAmount: raw.blindAmount,
                seenAmount: raw.seenAmount, 
                hasWinner: true,
                gameEnded:false
            }
            //console.log(sampleObj)
            let details = {username:winnerDetails.winner,potAmount:sampleObj.pot}
            playerSchema.findOneAndUpdate({ 'name': details.username }, { $inc: { 'amount': newPot } }, { returnOriginal: false, useFindAndModify: false, new: true }, function(err, success){
                if(err){
                    return err;
                }
                console.log(success)
                console.log(Number(success.amount.toString()))
                pusher.trigger('3HandPoker', 'retrieveGameState', sampleObj);
                return winnerDetails;
            });

           
        });

        
    }
}
exports.findHand = ([cards]) =>{
    let isSameSuite = false;
    let isSequence = false;
    let highCard = -1;
    let triple = false;
    let pair = false;
    let sequence = [cards[0].value, cards[1].value, cards[2].value];
    sequence.sort(function(a, b){return a-b});
    //console.log(sequence);
    highCard = sequence[2];
    if ((sequence[0] === sequence[1]) && (sequence[1] === sequence[2])) {
      triple = true;
      highCard = sequence[2];
      let response = {
        hand: winningHands.THREE_OF_A_KIND,
        highCard: highCard
      }
      return response;
    }
    if ((sequence[0] + 1 === sequence[1]) && (sequence[1] + 1 === sequence[2])) {
      isSequence = true;
      highCard = sequence[2];
    }
    if ((cards[0].suite === cards[1].suite) && (cards[1].suite === cards[2].suite)) {
      isSameSuite = true;
      highCard = sequence[2];
    }
    if (isSequence === true && isSameSuite === true) {
      let response = {
        hand: winningHands.STRAIGHT_FLUSH,
        highCard: highCard
      }
      return response;
    } else if (isSequence === true && isSameSuite === false) {
      let response = {
        hand: winningHands.STRAIGHT,
        highCard: highCard
      }
      //console.log()
      return response;
    } else if (isSequence === false && isSameSuite === true) {
      let response = {
        hand: winningHands.FLUSH,
        highCard: highCard
      }
      return response;
    }
    if (sequence[0] == sequence[1]) {
      pair = true;
      highCard = sequence[0]
    } else if (sequence[0] == sequence[2]) {
      pair = true;
      highCard = sequence[0]
    } else if (sequence[1] == sequence[2]) {
      pair = true;
      highCard = sequence[1]
    }
    if (pair == true) {
      let response = {
        hand: winningHands.PAIR,
        highCard: highCard
      }
      return response;
    }
    let response = {
      hand: winningHands.HIGH_CARD,
      highCard: highCard
    }
    return response;
  
  
}
  
exports.passBackWinner = ([firstPlayer, secondPlayer, firstUser, secondUser]) =>{
    for (let i = 0; i < winOrder.length; i++) {
      if (firstPlayer.hand === winningHands[winOrder[i]] || secondPlayer.hand === winningHands[winOrder[i]]) {
        if (firstPlayer.hand === winningHands[winOrder[i]] && secondPlayer.hand === winningHands[winOrder[i]]) {
          if (firstPlayer.highCard > secondPlayer.highCard) {
            return {
              user: firstUser,
              both: false
            }
          } else if (firstPlayer.highCard < secondPlayer.highCard) {
            return {
              user: secondUser,
              both: false
            }
          } else if (firstPlayer.highCard === secondPlayer.highCard) {
            return {
              user: firstUser,
              both: true
            }
          }
        } else if (firstPlayer.hand === winningHands[winOrder[i]] && secondPlayer.hand !== winningHands[winOrder[i]]) {
          return {
            user: firstUser,
            both: false
          }
        } else if (firstPlayer.hand !== winningHands[winOrder[i]] && secondPlayer.hand === winningHands[winOrder[i]]) {
          return {
            user: secondUser,
            both: false
          }
        }
      }
  
    }
  }


exports.endGame = async ([pusher]) =>{
    await gameStatusSchema.findOneAndUpdate({ 'gameId': 'Uno3Hand' }, { '$set': { 'gameEnded':true } }, { returnOriginal: false, useFindAndModify: false, new: true },
        function (error, raw) {
            if (error) {
                return error;
            }
            let sampleObj = {
                gameId: raw.gameId,
                playersRemaining: raw.playersRemaining,
                playersInRound: raw.playersInRound,
                pot: raw.pot,
                blindAmount: raw.blindAmount,
                seenAmount: raw.seenAmount, 
                hasWinner: true,
                gameEnded:true
            }
            pusher.trigger('3HandPoker', 'retrieveGameState', sampleObj);
        });

    await gameStatusSchema.collection.drop();
    await playerListSchema.collection.drop();
    await playerSchema.collection.drop();
    await listOfUsersSchema.collection.drop();
}

exports.foldUser = async([pusher]) =>{
    await gameStatusSchema.findOneAndUpdate({ 'gameId': 'Uno3Hand' }, { '$set': { 'hasWinner':true } }, { returnOriginal: false, useFindAndModify: false, new: true },
    function (error, raw) {
        if (error) {
            return error;
        }
        let sampleObj = {
            gameId: raw.gameId,
            playersRemaining: raw.playersRemaining,
            playersInRound: raw.playersInRound,
            pot: raw.pot,
            blindAmount: raw.blindAmount,
            seenAmount: raw.seenAmount, 
            hasWinner: true,
            gameEnded:false
        }
        pusher.trigger('3HandPoker', 'retrieveGameState', sampleObj);
    });
}