var express = require('express');
var router = express.Router();
var pokerRoutes = require('../poker/routes/pokerRoutes')

function init(app){
  app.use(pokerRoutes);
}

module.exports = {
  init:init
};
