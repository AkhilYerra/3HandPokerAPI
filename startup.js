var mongoose = require('mongoose')

exports.startUp = () =>{
var mongoDB = 'mongodb://127.0.0.1/poker';
try{
    mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
    console.log("Connected To Mongo");
}catch(err){
    console.log('FAILED')
}


  

}

