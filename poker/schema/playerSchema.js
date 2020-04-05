var mongoose = require('mongoose');


  var player = new mongoose.Schema({
    name:String,
    amount:Number, 
    hasSeen: Boolean,
    hasFolded: Boolean, 
    cards: [Object]
  });

  module.exports = mongoose.model('players', player);


