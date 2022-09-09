/* eslint-disable no-undef */
const Destination = require('./Destination');
const mongoose = require('mongoose');
require('dotenv').config();

const connectionStr = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(connectionStr);
const db = mongoose.connection;
const ObjectId = mongoose.Types.ObjectId;

db.once('open', () => {
    console.log('Database connected.');
});

db.on('error', (err) => {
    console.error('connection error: ', err);
});


// Database CRUD Helper Functions
const getWishlist = () => (
    Destination.find()
);

const saveDestination = (name, location, description, imageUrl) => {
    const newDestination = new Destination({
        name: name,
        location: location,
        description: description,
        image: imageUrl
    });

    return newDestination.save()
        .then((res) => res._id.toString());
};

const editDestination = (name, location, description, imageUrl, id) => (
    Destination.findOneAndUpdate(
        { 
            _id: new ObjectId(id)
        },
        {
            name: name,
            location: location,
            description: description,
            image: imageUrl,
        }
    )
);

const editDescription = (description, id) => (
    Destination.findOneAndUpdate(
        {
            _id: new ObjectId(id)
        },
        {
            description: description
        }
    )
);

const deleteDestination = (id) => (
    Destination.findOneAndDelete(
        {
            _id: new ObjectId(id) 
        }
    )
);

module.exports = { getWishlist, saveDestination, editDescription, editDestination, deleteDestination };
