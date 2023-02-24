import express from "express"
import * as bcrypt from 'bcryptjs'
import config from '../config.json'
import mongoose from "mongoose"
import jwt from 'jsonwebtoken'
import { Teacher, User, Course, Subject } from './models'
import cors from "cors"
const port = 8080;
const PRIVATE_KEY = config.JWT_private_key
mongoose.connect(config.connection_str)

const app = express();
app.use(express.json());


app.use(cors());
app.post('/newSubject', async (req, res) => {
    let { id, name, description, banner_img } = req.body
    Subject.create({ name, description, banner_img }).then(async result => {
        if (!result) {
            res.send({ status: 'not ok' })
            return
        }
        let course = await Course.findOne({ "nano_id": id })
        if (!course) {
            res.send({ status: 'not ok' })
            return
        }
        course.subjects.push(result.nano_id)
        course.save()
        res.send({ status: 'ok' })
    }).catch(err => {
        res.send({ status: 'not ok' })
        console.log(`${err.name}:${err.message}`)
    })
})
app.post('/newUnit', async (req, res) => {
    let { id, title } = req.body
    const sub = await Subject.findOne({ "nano_id": id })
    sub?.units.push({ name: title })
    sub?.save().then(result => {
        res.send({ status: 'ok' })
    }).catch(err => {
        res.send({ status: 'not ok' })
        console.log(`${err.name}:${err.message}`)
    })
})
app.post('/newUnitContent', async (req, res) => {
    let { id, uid, title } = req.body
    const sub = await Subject.findOne({ "nano_id": id })
    console.log(title)
    sub?.units[uid].contents.push({ name: title })
    sub?.save().then(result => {
        res.send({ status: 'ok' })
    }).catch(err => {
        res.send({ status: 'not ok' })
        console.log(`${err.name}:${err.message}`)
    })
})
app.post('/publishContent', async (req, res) => {
    //new video 
    let { teacher_name, teacher_id, title, video_url, description, id, uid, cid } = req.body
    Subject.findOne({ "nano_id": id }).then(data => {
        if (!data) {
            res.send({ status: 'not ok' })
            return
        }
        let units = data.units
        let sources = data.units[uid].contents[cid].sources
        let sid = sources.length
        sources.push({ teacher_name, teacher_id, title, description, video_url })
        Subject.findOneAndUpdate({ "nano_id": id }, { "units": units }).then(data => {
            if (!data) {
                res.send({ status: 'not ok' })
                return
            }
            Teacher.findOneAndUpdate({ "nano_id": teacher_id }, { $push: { "content": `${id}/${uid}/${cid}/${sid}` } })
                .then(data => {
                    res.send({ status: 'ok' })
                })
                .catch(err => {
                    console.log(`${err.name}:${err.message}`)
                })
        }).catch(err => {
            console.log(`${err.name}:${err.message}`)
        })
    }).catch(err => {
        console.log(`${err.name}:${err.message}`)
        res.send({ status: 'not ok' })
    })
})
app.post('/validateToken', async (req, res) => {
    const { email, role, token } = req.body
    const verified = jwt.verify(token, PRIVATE_KEY);
    if (!verified) res.send({ status: 'not ok' })
    let user = null
    if (role != 'teacher')
        user = await User.findOne({ email }, { password: 0 })
    else user = await Teacher.findOne({ email }, { password: 0 })
    if (!user) res.send({ status: 'not ok' })
    else
        res.send({ status: 'ok', role, data: user })
})
app.post('/getEnrolled', async (req, res) => {
    let { enrolled } = req.body
    Subject.find({ "nano_id": { "$in": enrolled } })
        .then(result => {
            res.send({ status: 'ok', data: result });
        })
        .catch(err => {
            console.log(`${err.name}:${err.message}`)
            res.send({ status: 'not ok' });
        });
})
app.post('/enrollUser', async (req, res) => {
    let { email, nano_id } = req.body
    User.findOne({ email }, { enrolled: 1 }).then((result: any) => {
        let temp: any = []
        if (result?.enrolled) {
            temp = [...result.enrolled]
            if (temp.includes(nano_id)) {
                res.send({ status: 'ok' })
                return
            }
        }
        temp.push(nano_id)
        User.findOneAndUpdate({ email }, { "enrolled": temp }).then((result: any) => {
            if (result) {
                res.send({ status: 'ok' })
            }
        })
    }).catch((err: any) => {
        console.log(`${err.name}:${err.message}`)
        res.send({ status: 'not ok' })
    })
})
app.post('/unenrollUser', async (req, res) => {
    let { email, nano_id } = req.body
    User.findOne({ email }, { enrolled: 1 }).then((result: any) => {
        let temp: any = []
        if (result?.enrolled) {
            temp = [...result.enrolled]
            if (!temp.includes(nano_id)) {
                res.send({ status: 'ok' })
                return
            }
        }
        temp = temp.filter((e: string) => e !== nano_id)
        User.findOneAndUpdate({ email }, { "enrolled": temp }).then((result: any) => {
            if (result) {
                res.send({ status: 'ok' })
            }
        })
    }).catch((err: any) => {
        console.log(`${err.name}:${err.message}`)
        res.send({ status: 'not ok' })
    })
})
app.post('/getSubjects', async (req, res) => {
    let { course_id } = req.body
    Course.findOne({ "nano_id": course_id }, { "name": 1, "subjects": 1 })
        .then((result: any) => {
            let name = result.name
            Subject.find({ "nano_id": { "$in": result.subjects } })
                .then(result => {
                    res.send({ status: 'ok', data: { name: name, subjects: result } });
                })
                .catch(err => {
                    console.log(`${err.name}:${err.message}`)
                    res.send({ status: 'not ok' });
                });
        })
        .catch(err => {
            console.log(`${err.name}:${err.message}`)
            res.send({ status: 'not ok' });
        });
})
app.post('/getSubjectDetails', async (req, res) => {
    let { nano_id } = req.body
    Subject.findOne({ nano_id })
        .then((result) => {
            res.send({ status: 'ok', data: result });
        })
        .catch(err => {
            console.log(`${err.name}:${err.message}`)
            res.send({ status: 'not ok' });
        });
})
app.get('/getCourses', async (req, res) => {
    Course.find({}, { name: 1, description: 1, category: 1, banner_img: 1, nano_id: 1 })
        .then((result) => {
            res.send({ status: 'ok', data: result });
        })
        .catch(err => {
            console.log(`${err.name}:${err.message}`)
            res.send({ status: 'not ok' });
        });
})
app.post('/newSubject', async (req, res) => {
    let { nano_id, name, course_id, description, category, banner_img, teacher, credentials } = req.body
    // if(!credentials){
    //     return
    // }
    let course: any = await Course.find({ nano_id: course_id })
    //let teachers
    if (course) {
        Subject.create({ nano_id, name, description, category, banner_img, teacher })
            .then(async (result: any) => {
                let { subjects } = course
                if (!subjects) subjects = []
                subjects.push(nano_id)
                Course.findOneAndUpdate({ nano_id: course_id }, { subjects })
                    .then((result) => {
                        res.send({ status: 'ok' });
                    })
                    .catch(err => {
                        console.log(`${err.name}:${err.message}`)
                        res.send({ status: 'not ok' });
                    });

            })
            .catch(err => {
                console.log(err)
                res.send({ status: 'not ok' });
            });
    }
})

app.post('/newCourse', async (req, res) => {
    let { name, description, category, banner_img, credentials } = req.body
    // if(!credentials){
    //     return
    // }
    await Course.create({ name, description, category, banner_img, credentials })
        .then(() => {
            res.send({ status: 'ok' });
        })
        .catch(err => {
            console.log(err)
            res.send({ status: 'not ok' });
        });
})


app.get("/", (req, res) => {
    res.send("api works");
})
app.post('/ifUser', async (req, res) => {
    let email = req.body.email
    let result = await User.findOne({ email })
    res.send({ exists: (result) ? true : false })
})
app.post('/login', async (req, res) => {
    let { email, password, role } = req.body
    let result = null;
    if (role != 'teacher') {
        result = await User.findOne({ email })
    }
    else {
        result = await Teacher.findOne({ email })
    }
    if (result) {
        bcrypt.compare(password, result.password, function (err, result) {
            if (result) {
                const jwtBearerToken = jwt.sign({ email, role }, PRIVATE_KEY)
                res.send({ status: 'ok', token: jwtBearerToken })
            }
            else {
                res.send({ status: 'not ok' })
            }
        })
    }
    else res.send({ status: 'not ok' })
})
app.post("/signup", async (req, res) => {
    let { user, role } = req.body
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, async function (err, hash) {
            var data = { ...user, password: hash };
            if (role != 'teacher') {
                let result = await User.create(data)
                    .then((result: any) => {
                        console.log(`new user ${user.name} created`)
                        res.send({ status: 'ok' });
                    })
                    .catch((err: any) => {
                        console.error(`${err.name}:${err.message}`)

                        res.send({ status: 'not ok' });
                    });
            } else {
                let result = await Teacher.create(data)
                    .then((result) => {
                        console.log(`new teacher ${user.name} created`)
                        res.send({ status: 'ok' });
                    })
                    .catch(err => {
                        console.error(`${err.name}:${err.message}`)

                        res.send({ status: 'not ok' });
                    });
            }

        });
    });
})



app.listen(process.env.PORT || port, () => {
    console.log(`Listening on port ${port}`);
});