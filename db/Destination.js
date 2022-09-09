const mongoose = require('mongoose');

// Schema & Model
const destinationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: 'https://c.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif'
    }
});

const Destination = mongoose.model('Destination', destinationSchema);

module.exports = Destination;