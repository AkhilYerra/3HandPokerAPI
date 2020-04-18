var mongoose = require('mongoose');


var player = new mongoose.Schema({
  name:String,
  amount: mongoose.Types.Decimal128, 
  hasSeen: Boolean,
  hasFolded: Boolean,
  isYourTurn: Boolean, 
  cards: [Object]
});

  var gameStatus = new mongoose.Schema({
    gameId:String,
    playersRemaining:Number,
    pot: mongoose.Types.Decimal128,
    blindAmount: Number,
    seenAmount:Number,
    playersInRound:Array,
    seenPlayersInRound:Array,
    hasWinner:Boolean,
    gameEnded:Boolean,
    consultInProgress:Boolean,
    ListOfPlayers: Object
  });



  module.exports = mongoose.model('gameStatus', gameStatus);
