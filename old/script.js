const bcrypt = require("bcrypt");
const { hash } = require("bcryptjs");
const { response } = require("express");
//const api_url = "<hosting_url>"
//for testing: use 8080
const api_url = "https://localhost:8080/user";

function register(records = []) {
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    var role = document.getElementById("role");
    var exists = 0;
    for(let i=0; i<records.length; i++) {
        if(records[i].email != email)
            continue;
        exists = 1;
        break;
    }
    if (exists == 0) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(password, salt, function(err, hash) {
                data = {name: name, email: email, password: hash, role: role};
                fetch(api_url, {
                    method: "POST",
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },body: JSON.stringify(data)
                })
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                    alert("Account registered successfully!")
                })
            });
        });
    }
    else {
        alert("Email already exists!");
    }
}

function login(records = []) {
    var email = document.getElementById("email");
    var password = document.getElementById("password");
    for(let i=0; i<records.length; i++) {
        if(records[i].email != email)
            continue;
        hash = records[i].password;
        bcrypt.compare(password, hash, function (err, result) {
            if (result)
            {
                //password valid
            }
            else
            {
                alert("Invalid credentials!");
            }
        })
        break;
    }
}