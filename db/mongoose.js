/* eslint-disable no-undef */
const mongoose = require('mongoose');
require('dotenv').config();

const connectionStr = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(connectionStr);
const db = mongoose.connection;

db.once('open', () => {
    console.log('Database connected.');
});

db.on('error', (err) => {
    console.error('connection error: ', err);
});

module.exports = { db };
