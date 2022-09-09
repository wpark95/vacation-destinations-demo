const mongoose = require('mongoose');

// Schema & Model
const destinationSchema = new mongoose.Schema({
    name: String,
    location: String,
    description: String,
    image: String,
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;