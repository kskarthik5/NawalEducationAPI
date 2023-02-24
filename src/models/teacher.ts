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
    content:[String]
});

const Teacher = model('navalAcademyTeachers', userSchema);

export default Teacher;