import { nanoid } from "nanoid";
import {model,Schema} from "mongoose";
const CourseSchema = new Schema({
    nano_id:{
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
      },
    name: {type:String,required:true,unique:true},
    description: {type:String},
    category:String,
    banner_img:String,
    subjects:{type:[String],required:true,unique:true,default:[]},
});

const Course = model('navalAcademyCourseContent', CourseSchema);

export default Course;