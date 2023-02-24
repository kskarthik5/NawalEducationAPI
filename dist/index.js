"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_json_1 = __importDefault(require("../config.json"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("./models");
const cors_1 = __importDefault(require("cors"));
const port = 8080;
const PRIVATE_KEY = config_json_1.default.JWT_private_key;
mongoose_1.default.connect(config_json_1.default.connection_str);
const app = express();
app.use(express.json());
app.use((0, cors_1.default)());
app.post('/newUnitContent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { id, uid, title } = req.body;
    res.send({ status: 'not ok' });
    models_1.Subject.findOne({ "nano_id": id })
        .then(data => {
        var tempid = data.units[uid]._id.toString();
        console.log(data);
        models_1.Subject.updateOne({ "nano_id": id }, { $push: { "units.$[uid].contents": { name: title } } }, { arrayFilters: [{ "uid._id": tempid }] })
            .then(data => {
            res.send({ status: 'ok' });
        })
            .catch(err => {
            console.log(err);
        });
    })
        .catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.post('/publishContent', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //new video 
    let { teacher_name, teacher_id, title, video_url, description, id, uid, cid } = req.body;
    models_1.Subject.findOne({ "nano_id": id }).then(data => {
        let units = data.units;
        let sources = data.units[uid].contents[cid].sources;
        let sid = sources.length;
        sources.push({ teacher_name, teacher_id, title, description, video_url });
        models_1.Subject.findOneAndUpdate({ "nano_id": id }, { "units": units }).then(data => {
            if (!data) {
                data.send({ status: 'not ok' });
                return;
            }
            models_1.Teacher.findOneAndUpdate({ "nano_id": teacher_id }, { $push: { "content": `${id}/${uid}/${cid}/${sid}` } })
                .then(data => {
                res.send({ status: 'ok' });
            })
                .catch(err => {
                console.log(`${err.name}:${err.message}`);
            });
        }).catch(err => {
            console.log(`${err.name}:${err.message}`);
        });
    }).catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.post('/validateToken', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, role, token } = req.body;
    const verified = jsonwebtoken_1.default.verify(token, PRIVATE_KEY);
    if (!verified)
        res.send({ status: 'not ok' });
    let user = null;
    if (role != 'teacher')
        user = yield models_1.User.findOne({ email }, { password: 0 });
    else
        user = yield models_1.Teacher.findOne({ email }, { password: 0 });
    if (!user)
        res.send({ status: 'not ok' });
    else
        res.send({ status: 'ok', role, data: user });
}));
app.post('/getEnrolled', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { enrolled } = req.body;
    models_1.Subject.find({ "nano_id": { "$in": enrolled } })
        .then(result => {
        res.send({ status: 'ok', data: result });
    })
        .catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.post('/enrollUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, nano_id } = req.body;
    models_1.User.findOne({ email }, { enrolled: 1 }).then((result) => {
        let temp = [];
        if (result === null || result === void 0 ? void 0 : result.enrolled) {
            temp = [...result.enrolled];
            if (temp.includes(nano_id)) {
                res.send({ status: 'ok' });
                return;
            }
        }
        temp.push(nano_id);
        models_1.User.findOneAndUpdate({ email }, { "enrolled": temp }).then((result) => {
            if (result) {
                res.send({ status: 'ok' });
            }
        });
    }).catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.post('/unenrollUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, nano_id } = req.body;
    models_1.User.findOne({ email }, { enrolled: 1 }).then((result) => {
        let temp = [];
        if (result === null || result === void 0 ? void 0 : result.enrolled) {
            temp = [...result.enrolled];
            if (!temp.includes(nano_id)) {
                res.send({ status: 'ok' });
                return;
            }
        }
        temp = temp.filter(e => e !== nano_id);
        models_1.User.findOneAndUpdate({ email }, { "enrolled": temp }).then((result) => {
            if (result) {
                res.send({ status: 'ok' });
            }
        });
    }).catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.post('/getSubjects', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { course_id } = req.body;
    models_1.Course.findOne({ "nano_id": course_id }, { "name": 1, "subjects": 1 })
        .then((result) => {
        let name = result.name;
        models_1.Subject.find({ "nano_id": { "$in": result.subjects } })
            .then(result => {
            res.send({ status: 'ok', data: { name: name, subjects: result } });
        })
            .catch(err => {
            console.log(`${err.name}:${err.message}`);
            res.send({ status: 'not ok' });
        });
    })
        .catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.post('/getSubjectDetails', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { nano_id } = req.body;
    models_1.Subject.findOne({ nano_id })
        .then((result) => {
        res.send({ status: 'ok', data: result });
    })
        .catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.get('/getCourses', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    models_1.Course.find({}, { name: 1, description: 1, category: 1, banner_img: 1, nano_id: 1 })
        .then((result) => {
        res.send({ status: 'ok', data: result });
    })
        .catch(err => {
        console.log(`${err.name}:${err.message}`);
        res.send({ status: 'not ok' });
    });
}));
app.post('/newSubject', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { nano_id, name, course_id, description, category, banner_img, teacher, credentials } = req.body;
    // if(!credentials){
    //     return
    // }
    let course = yield models_1.Course.find({ nano_id: course_id });
    //let teachers
    if (course) {
        models_1.Subject.create({ nano_id, name, description, category, banner_img, teacher })
            .then((result) => __awaiter(void 0, void 0, void 0, function* () {
            let { subjects } = course;
            if (!subjects)
                subjects = [];
            subjects.push(nano_id);
            models_1.Course.findOneAndUpdate({ nano_id: course_id }, { subjects })
                .then((result) => {
                res.send({ status: 'ok' });
            })
                .catch(err => {
                console.log(`${err.name}:${err.message}`);
                res.send({ status: 'not ok' });
            });
        }))
            .catch(err => {
            console.log(err);
            res.send({ status: 'not ok' });
        });
    }
}));
app.post('/newCourse', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { nano_id, name, description, category, banner_img, credentials } = req.body;
    console.log(req.body);
    // if(!credentials){
    //     return
    // }
    yield models_1.Course.create({ name, description })
        .then((result) => {
        res.send({ status: 'ok' });
    })
        .catch(err => {
        console.log(err);
        res.send({ status: 'not ok' });
    });
}));
app.get("/", (req, res) => {
    res.send("api works");
});
app.post('/ifUser', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let email = req.body.email;
    let result = yield models_1.User.findOne({ email });
    res.send({ exists: (result) ? true : false });
}));
app.post('/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password, role } = req.body;
    let result = null;
    if (role != 'teacher') {
        result = yield models_1.User.findOne({ email });
    }
    else {
        result = yield models_1.Teacher.findOne({ email });
    }
    if (result) {
        bcryptjs_1.default.compare(password, result.password, function (err, result) {
            if (result) {
                const jwtBearerToken = jsonwebtoken_1.default.sign({ email, role }, PRIVATE_KEY);
                res.send({ status: 'ok', token: jwtBearerToken });
            }
            else {
                res.send({ status: 'not ok' });
            }
        });
    }
    else
        res.send({ status: 'not ok' });
}));
app.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { user, role } = req.body;
    bcryptjs_1.default.genSalt(10, (err, salt) => {
        bcryptjs_1.default.hash(user.password, salt, function (err, hash) {
            return __awaiter(this, void 0, void 0, function* () {
                var data = Object.assign(Object.assign({}, user), { password: hash });
                if (role != 'teacher') {
                    let result = yield models_1.User.create(data)
                        .then((result) => {
                        console.log(`new user ${user.name} created`);
                        res.send({ status: 'ok' });
                    })
                        .catch(err => {
                        console.error(`${err.name}:${err.message}`);
                        res.send({ status: 'not ok' });
                    });
                }
                else {
                    let result = yield models_1.Teacher.create(data)
                        .then((result) => {
                        console.log(`new teacher ${user.name} created`);
                        res.send({ status: 'ok' });
                    })
                        .catch(err => {
                        console.error(`${err.name}:${err.message}`);
                        res.send({ status: 'not ok' });
                    });
                }
            });
        });
    });
}));
app.listen(process.env.PORT || port, () => {
    console.log(`Listening on port ${port}`);
});
//# sourceMappingURL=index.js.map