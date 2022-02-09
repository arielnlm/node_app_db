const { sequelize, Events} = require('../models');
const express = require('express');
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));
const {eventSchema} = require('../validation_schema');

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

// Get events
route.get('/', (req, res) => {
    /*if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }*/
    Events.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});

// Get one event
route.get('/:id', (req, res) => {
   /* if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }*/
    console.log("pokusavam trazim");
    Events.findOne({ where: { id: req.params.id }} )
        .then( rows => {
            console.log("nasao sam " + rows.guests);
            res.json(rows); 
        })
        .catch( err => res.status(500).json(err) );
});

// Create events
route.post('/', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    eventSchema.validateAsync(req.body).then(obj => {
       obj = req.body;
        Events.create(obj).then(row =>{
            console.log("Event succesfully created!");
            res.json(row);
        }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(600).json(err));  
});

// Edit events
route.put("/:id", (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    eventSchema.validateAsync(req.body).then(obj => {
        Events.findOne({ where: { id: req.params.id }}).then(event =>{
            event.name = req.body.name;
            event.description = req.body.description;
            event.date = req.body.date;
            event.time = req.body.time;
            event.host = req.body.host;
            event.guests = req.body.guests;
            event.save();
            res.json(event);
        }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(600).json(err)); 
});


// One more person coming
route.get("/coming/:id", (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    Events.findOne({ where: { id: req.params.id }}).then(event =>{
        event.guests = event.guests + 1;
        event.save();
        console.log("plus jedan ima " + event.guests);
        res.json(event);
    }).catch(err => res.status(500).json(err));
});

// Delete events
route.delete('/:id', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    Events.findOne({ where: { id: req.params.id }}).then(event =>{
        event.destroy();
        res.json(event);
    }).catch(err => res.status(500).json(err));
});

module.exports = route;