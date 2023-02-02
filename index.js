const express = require("express");
const port = 8080;
const bcrypt = require('bcryptjs')
const config = require('./config.json');
const mongoose = require("mongoose");
const jwt = require('jsonwebtoken')
const PRIVATE_KEY = config.JWT_private_key
mongoose.connect(config.connection_str, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
const { User, Course, Subject } = require('./models')

const app = express();
app.use(express.json());

var cors = require("cors");
app.use(cors());
app.post('/validateToken', async (req, res) => {
    const { email, token } = req.body
    const verified = jwt.verify(token, PRIVATE_KEY);
    if (!verified) res.send({ status: 'not ok' })
    let user = await User.findOne({ email }, { password: 0 })
    if (!user) res.send({ status: 'not ok' })
    res.send({ status: 'ok', data: user })
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
    User.findOne({ email }, { enrolled: 1 }).then((result) => {
        let temp = []
        if (result?.enrolled) {
            temp = [...result.enrolled]
            if (temp.includes(nano_id)) {
                res.send({ status: 'ok' })
                return
            }
        }
        temp.push(nano_id)
        User.findOneAndUpdate({ email }, { "enrolled": temp }).then((result) => {
            if (result) {
                res.send({ status: 'ok' })
            }
        })
    }).catch(err => {
        console.log(`${err.name}:${err.message}`)
        res.send({ status: 'not ok' })
    })
})
app.post('/unenrollUser', async (req, res) => {
    let { email, nano_id } = req.body
    User.findOne({ email }, { enrolled: 1 }).then((result) => {
        let temp = []
        if (result?.enrolled) {
            temp = [...result.enrolled]
            if (!temp.includes(nano_id)) {
                res.send({ status: 'ok' })
                return
            }
        }
        temp=temp.filter(e=>e!==nano_id)
        User.findOneAndUpdate({ email }, { "enrolled": temp }).then((result) => {
            if (result) {
                res.send({ status: 'ok' })
            }
        })
    }).catch(err => {
        console.log(`${err.name}:${err.message}`)
        res.send({ status: 'not ok' })
    })
})
app.post('/getSubjects', async (req, res) => {
    let { course_id } = req.body
    Course.findOne({ "nano_id": course_id }, { "name": 1, "subjects": 1 })
        .then((result) => {
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
    let course = await Course.find({ nano_id: course_id })
    //let teachers
    if (course) {
        Subject.create({ nano_id, name, description, category, banner_img, teacher })
            .then(async (result) => {
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
    let { nano_id, name, description, category, banner_img, credentials } = req.body
    console.log(req.body)
    // if(!credentials){
    //     return
    // }
    await Course.create({ name, description })
        .then((result) => {
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
    let { email, password } = req.body
    let result = await User.findOne({ email })
    if (result) {
        bcrypt.compare(password, result.password, function (err, result) {
            if (result) {
                const jwtBearerToken = jwt.sign({ email }, PRIVATE_KEY)
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
    let user = req.body
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, async function (err, hash) {
            var data = { ...user, password: hash };
            let result = await User.create(data)
                .then((result) => {
                    console.log(`new user ${user.name} created`)
                    res.send({ status: 'ok' });
                })
                .catch(err => {
                    console.error(`${err.name}:${err.message}`)

                    res.send({ status: 'not ok' });
                });

        });
    });
})



app.listen(process.env.PORT || port, () => {
    console.log(`Listening on port ${port}`);
});