"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const mongoose_1 = require("mongoose");
const CourseSchema = new mongoose_1.Schema({
    nano_id: {
        type: String,
        required: true,
        default: () => (0, nanoid_1.nanoid)(9),
        unique: true,
    },
    name: { type: String, required: true, unique: true },
    description: { type: String },
    category: String,
    banner_img: String,
    subjects: { type: [String], required: true, unique: true, default: [] },
});
const Course = (0, mongoose_1.model)('navalAcademyCourseContent', CourseSchema);
exports.default = Course;
//# sourceMappingURL=course.js.map