"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var { nanoid } = require("nanoid");
const { model, Schema } = require("mongoose");
const userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    nano_id: {
        type: String,
        required: true,
        default: () => nanoid(9),
        unique: true,
    },
    enrolled: [String],
    followed: [String],
});
const User = model('navalAcademyUsers', userSchema);
exports.default = User;
//# sourceMappingURL=user.js.map