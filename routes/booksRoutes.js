const { sequelize, Books} = require('../models');
const express = require('express');
const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));
const {bookSchema} = require('../validation_schema');

// Get books
route.get('/', (req, res) => {
    /*if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }*/
    Books.findAll()
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});
// Get specific book
route.get('/:id', (req, res) => {
   /* if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }*/
    Books.findOne({ where: { id: req.params.id } })
        .then( rows => res.json(rows) )
        .catch( err => res.status(500).json(err) );
});
// Create book
route.post('/', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    bookSchema.validateAsync(req.body).then(obj => {
        obj = req.body;
        Books.create(obj).then(row =>{
            console.log("Book succesfully created!");
            res.json(row);
        }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(600).json(err));  
});

// Edit book
route.put("/:id", (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    bookSchema.validateAsync(req.body).then(obj => {
        Books.findOne({ where: { id: req.params.id }}).then(book =>{
            book.name = req.body.name;
            book.author = req.body.author;
            book.description = req.body.description;
            book.userId = req.body.userId;
            book.save();
            res.json(book);
        }).catch(err => res.status(500).json(err));
    }).catch(err => res.status(600).json(err)); 
});

// Book taken
route.put("/take/:id", (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    console.log("knjiga sa " + req.params.id);
    Books.findOne({ where: { id: req.params.id }}).then(book =>{
        console.log("nasao knjiguuuuuuuuuuuuuul");
        console.log("sa " + req.body.userId);
        book.userId = req.body.userId;
        book.save();
        res.json(book);
    }).catch(err => res.status(500).json(err));
});

// Delete book
route.delete('/:id', (req, res) => {
    if(!isLogged(req)){
        res.status(403).json(err);
        return;
    }
    Books.findOne({ where: { id: req.params.id }}).then(book =>{
        book.destroy();
        res.json(book);
    }).catch(err => res.status(500).json(err));
});

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

module.exports = route;