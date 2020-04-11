var mongoose = require('mongoose')

exports.startUp = () =>{
//DEV MONGO :  mongodb+srv://akhilPoker:Laser360@cluster0-tme7p.gcp.mongodb.net/test?retryWrites=true&w=majority
//LOCAL MONGO: mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false
var mongoDB = 'mongodb+srv://akhilPoker:Laser360@cluster0-tme7p.gcp.mongodb.net/test?retryWrites=true&w=majority';
try{
    mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
    console.log("Connected To Mongo");
}catch(err){
    console.log('FAILED')
}


  

}

