const {model,Schema} = require("mongoose");
const Content=new Schema({
    name:{type:String,required:true},
    description: {type:String},
    video_url:{type:String}
})
const SubjectUnit=new Schema({
    name:{type:String,required:true},
    description: {type:String},
    content:[Content]
})
const SubjectSchema=new Schema({
    nano_id:{type:String,required:true,unique:true},
    name:{type:String,required:true},
    description: {type:String},
    teacher:{type:String},
    category:{type:String},
    banner_img:String,
    units:[SubjectUnit]
})
const Subject = model('navalAcademySubjectContent', SubjectSchema);

module.exports = Subject;