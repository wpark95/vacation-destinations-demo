/* eslint-disable no-undef */
require('dotenv').config();
const mongoose = require('mongoose');
const connectionStr = process.env.MONGO_CONNECTION_STRING;
mongoose.connect(connectionStr);
const db = mongoose.connection;

db.once('open', () => {
    console.log('Database connected.');
});

db.on('error', (err) => {
    console.error('connection error: ', err);
});

// Schema & Model
const destinationSchema = new mongoose.Schema({
    name: String,
    location: String,
    description: String,
    image: String,
});
const Destination = mongoose.model('Destination', destinationSchema);

const getDestination = async () => (
    await Destination.find()
        .then((destinations) => (
            destinations
        ))
        .catch((error) => {
            console.error(error);
        })
);

// Helper Functions
const saveDestination = async (name, location, description, imageUrl) => {
    const newDestination = new Destination({
        name: name,
        location: location,
        description: description,
        image: imageUrl
    });

    return await newDestination.save()
        .then((res) => (
            res._id.toString())
        )
        .catch((error) => {
            console.error(error);
        });
};

const editDestination = async (name, location, description, imageUrl, id) => {
    return await Destination.findOneAndUpdate(
        { 
            _id: id
        },
        {
            name: name,
            location: location,
            description: description,
            image: imageUrl,
        }
    )
        .then((res) => (
            res._id.toString())
        )
        .catch((error) => {
            console.error(error);
        });
};

const editDescription = async (description, id) => {
    return await Destination.findOneAndUpdate(
        {
            _id: id
        },
        {
            description: description
        }
    )
        .then((res) => (
            res._id.toString())
        )
        .catch((error) => {
            console.error(error);
        });
} 

const deleteDestination = async (id) => {
    return await Destination.findOneAndDelete(
        { _id: new mongoose.Types.ObjectId(id) }
    )
        .then((result) => {
            return result;
        })
        .catch((error) => {
            throw error;
        });
};

module.exports = { getDestination, saveDestination, editDestination, editDescription, deleteDestination }
