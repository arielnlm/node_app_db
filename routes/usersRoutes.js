const { sequelize, Users} = require('../models');
const {userSchema} = require('../validation_schema');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const e = require('express');
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));

function getCookies(req) {
    if (req.headers.cookie == null) return {};

    const rawCookies = req.headers.cookie.split('; ');
    const parsedCookies = {};

    rawCookies.forEach( rawCookie => {
        const parsedCookie = rawCookie.split('=');
        parsedCookies[parsedCookie[0]] = parsedCookie[1];
    });

    return parsedCookies;
};

function isAdmin(req){
    let token = req.headers['authorization'];
    if(token == undefined)
        return false;
    token = token.split(' ')[1];
    if(token == undefined)
        return false;
    
    return jwt.decode(token).admin;
}

function isLogged(req){
    let token = req.headers['authorization'];
    if(token == undefined)
        return false;
    token = token.split(' ')[1];
    if(token == undefined)
        return false;

    return true;
}

//Get all users
route.get('/', (req, res) => {
        if(!isLogged(req)){
            res.status(403).json(err);
            return;
        }
        console.log("prosao");
        Users.findAll()
        .then( rows => {
            rows.password
            res.json(rows)
        } )
        .catch( err => res.status(550).json(err) );
});

//Get one user
route.get('/:id', (req, res) => {
    /*if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }*/
        Users.findOne({where: {id: req.params.id}})
        .then( rows =>{
            res.json(rows);
        })
        .catch( err => res.status(550).json(err) );
});

//Get user by name
route.get('/name/:name', (req, res) => {
    /*if(!isLogged(req)){
        res.status(403);
        return;
    }*/
    console.log("Trazim usera");
    Users.findOne({where: {name: req.params.name}})
    .then( rows => res.json(rows) )
    .catch( err => res.status(550).json(err) );
});

route.get('/current/data', (req, res) => {
    console.log("pozvan");
    if(!isLogged(req)){
        res.status(403);
        return;
    }
    console.log("radiom");
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    let user = jwt.decode(token);
    Users.findOne({where: {id: user.userId}})
    .then( rows => res.json(rows) )
    .catch( err => res.status(550).json(err) );
});
// Create user
route.post('/', (req, res) => {
    if(isAdmin(req) == false){
        res.status(403).json(err);
        return;
    }
    userSchema.validateAsync(req.body).then(obj => {
        console.log(obj.email);
    obj = req.body;
    obj.password = bcrypt.hashSync(req.body.password, 10);
    console.log(obj.password);
        Users.create(obj).then(row =>{
            console.log("User succesfully created!");
            res.json(row);
        }).catch(err => res.status(500).json(err));

    }).catch(err => res.status(600).json(err));    
});

// Create user
route.post('/register', (req, res) => {
    userSchema.validateAsync(req.body).then(obj => {
    obj = req.body;
    console.log(obj.email);
    obj.password = bcrypt.hashSync(req.body.password, 10);
    console.log(obj.password);
        Users.create(obj).then(row =>{
            console.log("User succesfully created!");
            res.json(row);
        }).catch(err => res.status(500).json(err));

    }).catch(err => res.status(600).json(err));    
});
// update logged in user
route.put("/", (req, res) => {
    if(isLogged == false){
        res.status(501);
        return;
    }
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    let user = jwt.decode(token);
    Users.findOne({ where: { id: user.userId }}).then(usr =>{
        usr.name = req.body.name;
        usr.email = req.body.email;
        if(req.body.password && req.body.password.length > 0){
            usr.password = bcrypt.hashSync(req.body.password, 10);
        }
        usr.save();
        res.json(usr);
    }).catch(err => res.status(500).json(err));
});
// Edit user
route.put("/:id", (req, res) => {
    if(isAdmin(req) == false){
        res.status(403).json(err);
        return;
    }
    userSchema.validateAsync(req.body).then(obj => {
        Users.findOne({ where: { id: req.params.id }}).then(usr =>{
            usr.name = req.body.name;
            usr.email = req.body.email;
            usr.password = bcrypt.hashSync(req.body.password, 10);
            usr.mod = req.body.mod;
            usr.admin = req.body.admin;
            usr.save();
            res.json(usr);
        }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(600).json(err));   
});

// Delete user
route.delete('/:id', (req, res) => {
    if(isAdmin(req) == false){
        res.status(403).json(err);
        return;
    }
    Users.findOne({ where: {  id: req.params.id }}).then(usr =>{
        usr.destroy();
        res.json(usr);
    }).catch(err => res.status(500).json(err));

});

module.exports = route;