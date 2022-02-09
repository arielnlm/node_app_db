const usersRoutes = require('./usersRoutes');
const booksRoutes = require('./booksRoutes');
const messagesRoutes = require('./messagesRoutes');
const eventsRoutes = require('./eventsRoutes');

const express = require('express');

const route = express.Router();
route.use(express.json());
route.use(express.urlencoded({ extended: true }));

route.use('/users', usersRoutes);
route.use('/messages', messagesRoutes);
route.use('/books', booksRoutes);
route.use('/events', eventsRoutes);

module.exports = route;