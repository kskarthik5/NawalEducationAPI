"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
var { nanoid } = require("nanoid");
const Source = new mongoose_1.Schema({
    teacher_id: String,
    teacher_name: String,
    title: String,
    description: String,
    video_url: String,
});
const Content = new mongoose_1.Schema({
    name: { type: String, required: true },
    sources: [Source]
});
const SubjectUnit = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: { type: String },
    contents: [Content]
});
const SubjectSchema = new mongoose_1.Schema({
    nano_id: {
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
    },
    name: { type: String, required: true },
    description: { type: String },
    teacher: { type: String },
    category: { type: String },
    banner_img: String,
    units: [SubjectUnit]
});
const Subject = (0, mongoose_1.model)('navalAcademySubjectContent', SubjectSchema);
exports.default = Subject;
//# sourceMappingURL=subject.js.map