var mongoose = require('mongoose')

exports.startUp = () =>{
var mongoDB = 'mongodb+srv://akhilPoker:Laser360@cluster0-tme7p.gcp.mongodb.net/test?retryWrites=true&w=majority';
try{
    mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
    console.log("Connected To Mongo");
}catch(err){
    console.log('FAILED')
}


  

}

