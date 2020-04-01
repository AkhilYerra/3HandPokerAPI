var mongoose = require('mongoose');

  var player = new mongoose.Schema({
    name:  String, 
    amount: Number, 
    comments: [{ body: String, date: Date }],
  });

