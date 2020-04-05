import { json } from "express";
const card = require('./card')

const player = (jsonObject) =>{
    this.playerName = jsonObject.playerName;
    this.amount = jsonObject.amount;
    this.hasSeen = jsonObject.hasSeen;
    this.hasFolded = jsonObject.hasFolded;
    this.cards = jsonObject.cards;
}

export default player;
