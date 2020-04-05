var mongoose = require('mongoose');


  var player = new mongoose.Schema({
    name:String,
    amount: mongoose.Types.Decimal128, 
    hasSeen: Boolean,
    hasFolded: Boolean,
    isYourTurn: Boolean, 
    cards: [Object]
  });

  module.exports = mongoose.model('players', player);


