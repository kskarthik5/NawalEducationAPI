const {model,Schema} = require("mongoose");

const CourseSchema = new Schema({
    nano_id:String,
    name: {type:String,required:true,unique:true},
    description: {type:String},
    category:String,
    banner_img:String,
    subjects:[String]
});

const Course = model('navalAcademyCourseContent', CourseSchema);

module.exports= Course;