var mongoose = require('mongoose');

  var listOfUsers = new mongoose.Schema({
    type:String,
    users: [String], 
  });

  module.exports = mongoose.model('listOfUsers', listOfUsers);
