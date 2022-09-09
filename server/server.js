/* eslint-disable no-undef */
const app = require('./app.js');
const path = require('path');
const express = require('express');
require('../db/mongoose');

const port = process.env.PORT || 3000;
const clientPath = path.join(__dirname, '..', 'client');

app.use('/', express.static(clientPath));

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});