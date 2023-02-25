import { nanoid } from "nanoid";
import {model,Schema} from "mongoose";
const userSchema = new Schema({
    name: {type:String,required:true},
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    nano_id:{
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
      },
    enrolled:[String],
    followed:[String],
});

const User = model('navalAcademyUsers', userSchema);

export default User;