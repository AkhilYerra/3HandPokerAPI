var mongoose = require('mongoose');


  var playerList = new mongoose.Schema({
    name: String,
    list : Array
});

  module.exports = mongoose.model('playerList', playerList);


