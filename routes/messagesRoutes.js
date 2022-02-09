const { sequelize, Messages} = require('../models');
const express = require('express');
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));
const {messageSchema} = require('../validation_schema');
const jwt = require('jsonwebtoken');

function isLogged(req){
    console.log(req.headers);
    let token = req.headers['authorization'];
    if(token == undefined)
        return false;
    token = token.split(' ')[1];
    if(token == undefined)
        return false;

    return true;
}

// Get messages
route.get('/', (req, res) => {
    /*if(!isLogged(req)){
        res.status(403);
        return;
    }*/
    
    Messages.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});
route.get('/user/all', (req, res) => {
    if(!isLogged(req)){
        res.status(403);
        return;
    } 
    let token = req.headers['authorization'];
    token = token.split(' ')[1];
    let user = jwt.decode(token);
    console.log("Trazim + " + user.userId);
    Messages.findAll({ where: { userId: user.userId} })
        .then( rows => {
            console.log("rows " + rows);
            res.json(rows)
        } )
        .catch( err => {
            res.status(500).json(err) 
        });
});
// Get specific message
route.get('/:id', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    Messages.findOne({ where: { id: req.params.id } })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

// Get users message
route.get('/user/:id', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    Messages.findOne({ where: { id: req.params.id } })
        .then( rows => {
            console.log("printam ovo")
            console.log(rows);
            res.json(rows)
        } )
        .catch( err => {
            console.log("eror");
            res.status(500).json(err) 
        });
});

// Create message
route.post('/', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    console.log("pokusavam " + req.body.userId);
    messageSchema.validateAsync(req.body).then(obj => {
        Messages.create(obj).then(row =>{
            console.log("Message succesfully created!");
            res.json(row);
        }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(600).json(err));  
});

// Edit message
route.put("/:id", (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    messageSchema.validateAsync(req.body).then(obj => {
        Messages.findOne({ where: { id: req.params.id }}).then(messages =>{
            messages.body = req.body.body;
            messages.userId = req.body.userId;
            messages.save();
            res.json(messages);
        }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(600).json(err)); 
});

// Delete book
route.delete('/:id', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    Messages.findOne({ where: { id: req.params.id }}).then(messages =>{
        messages.destroy();
        res.json(messages);
    }).catch(err => res.status(500).json(err));
});

module.exports = route;