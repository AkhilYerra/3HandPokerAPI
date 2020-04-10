var mongoose = require('mongoose');

  var gameStatus = new mongoose.Schema({
    gameId:String,
    playersRemaining:Number,
    pot: mongoose.Types.Decimal128,
    blindAmount: Number,
    seenAmount:Number,
    playersInRound:Array,
    winnerDetermined:Boolean 
  });

  module.exports = mongoose.model('gameStatus', gameStatus);
