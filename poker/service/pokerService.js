const mongoose = require('mongoose')
const listOfUsersSchema = require('../schema/ListOfUsersSchema')


exports.addPlayerToMongo = async ([userNameToAdd, pusher]) =>{
    let results = await listOfUsersSchema.findOneAndUpdate(
        { "type": 'ListOfPlayers' },
        { "$addToSet": { "users": userNameToAdd } },
        { returnOriginal: false, useFindAndModify:false , new:true},
        function (err, raw) {
            if (err){
                return err;
            }
            pusher.trigger('3HandPoker', 'addPlayerToMongo', {
                'arrayOfUsers': raw.users,
              });
        }
     );
     return(null, results);     
}