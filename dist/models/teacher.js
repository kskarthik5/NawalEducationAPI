"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nanoid_1 = require("nanoid");
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nano_id: {
        type: String,
        required: true,
        default: () => (0, nanoid_1.nanoid)(9),
        unique: true,
    },
    content: [String]
});
const Teacher = (0, mongoose_1.model)('navalAcademyTeachers', userSchema);
exports.default = Teacher;
//# sourceMappingURL=teacher.js.map