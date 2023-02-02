const {model,Schema} = require("mongoose");
const userSchema = new Schema({
    name: {type:String,required:true},
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    role: {type:String,required:true},
    nano_id:{type:String,required:true,unique:true},
    enrolled:[String]
});

const User = model('navalAcademyUsers', userSchema);

module.exports= User;