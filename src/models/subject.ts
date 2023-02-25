import { nanoid } from "nanoid";
import {model,Schema} from "mongoose";
const Source = new Schema({
    source_id:{
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
      },
    teacher_id:String,
    teacher_name:String,
    title:String,
    description:String, 
    video_url:String,
});
const ContentSchema=new Schema({
    content_id:{
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
      },
    name:{type:String,required:true},
    sources:[Source]
})
const SubjectUnit=new Schema({
    unit_id:{
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
      },
    name:{type:String,required:true},
    description: {type:String},
    contents:[ContentSchema]
})
const SubjectSchema=new Schema({
    nano_id:{
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
      },
    name:{type:String,required:true},
    description: {type:String},
    teacher:{type:String},
    category:{type:String},
    banner_img:String,
    units:[SubjectUnit]
})
const Subject = model('naSubjectContent', SubjectSchema);

export default Subject;