const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const adminRoutes = require('./routes/adminRoutes');
require('dotenv').config();

const cors = require('cors');
const {sequelize, Messages} = require('./models');
const {userSchema, messageSchema} = require('./validation_schema');
const {Server} = require("socket.io");
const http = require('http');

const server = http.createServer(app);
const io =  new Server(server, {
    cors: {
        origin: 'http://app413.herokuapp.com/',
        methods: ['GET', 'POST'],
        credentials: true
    },
    allowEIO3: true
});
var corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

app.use(express.json());
app.use(cors(corsOptions));

app.use('/api', adminRoutes);

function authSocket(msg, next) {
    if (msg[1].token == null) {
        next(new Error("Not authenticated"));
    } else {
        jwt.verify(msg[1].token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                next(new Error(err));
            } else {
                msg[1].user = user;
                next();
            }
        });
    }
}

io.on('connection', socket => {
    console.log("konekciaj soketa 9000 ");
    socket.use(authSocket);
    socket.on('message', msg =>{
        console.log("Mejl saljem: " + msg.userId);
        let msgData = {userId: msg.userId, body: msg.body};
        messageSchema.validateAsync(msgData).then(obj => {
            Messages.create(obj).then(row =>{
                console.log("Message succesfully created!");
                io.emit('message', JSON.stringify(row));
            }).catch(err => socket.emit('error', err.message));
        }).catch(err => socket.emit('error', err.message)); 
        
    });

    socket.on('error', err => {
        socket.emit('error', err.message);
    });
});

server.listen({ port: process.env.PORT || 9000 }, async () => {
    console.log("slusam na portu 9000");
    await sequelize.authenticate();
});