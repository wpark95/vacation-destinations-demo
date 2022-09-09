/* eslint-disable no-undef */
const express = require('express');
const https = require('https');
const Destination = require('../db/Destination');
const bodyParser = require('body-parser');
require('dotenv').config();
const ObjectId = require('mongoose').Types.ObjectId;

const app = express();
const defaultImgUrl = 'https://c.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif';

app.use(bodyParser.json());

app.get('/wishlist', (req, res) => {
    Destination.find()
        .then((documents) => {
            res.status(200);
            res.send(documents);
        })
        .catch((error) => {
            console.log('DB read FAILED');
            console.error(error);
            res.sendStatus(500);
        });
});

app.post('/destination', async (req, res) => {
    const { name, location, description } = req.body;
    let isDefaultImage = false;

    const url = await getImageUrl(name, location)
        .catch((error) => {
            console.error(error);
            isDefaultImage = true;
            return defaultImgUrl;
        });

    saveDestination(name, location, description, url)
        .then((id) => {
            res.status(201);
            res.send({ 
                id: id,
                url: url,
                isDefaultImage: isDefaultImage
             });
        })
        .catch((error) => {
            console.log('DB write FAILED');
            console.error(error);
        });
});

app.put('/destination', async (req, res) => {
    if (!req.body.name && !req.body.location) { // Updating description only, no need to update image url
        const { description, id } = req.body;

        editDescription(description, id)
            .then(() => {
                res.sendStatus(200);
            })
            .catch((error) => {
                console.log('DB edit FAILED');
                console.error(error);
                res.sendStatus(500);
            });
    }

    if (req.body.name || req.body.location) { // Updating name and/or location, update image url
        const { name, location, description, id } = req.body;
        let isDefaultImage = false;

        const url = await getImageUrl(name, location)
            .catch((error) => {
                console.error(error);
                isDefaultImage = true;
                return defaultImgUrl;
            });
        editDestination(name, location, description, url, id)
            .then(() => {
                res.status(200);
                res.send({ 
                    url: url,
                    isDefaultImage: isDefaultImage
                 });
            })
            .catch((error) => {
                console.log('DB edit FAILED');
                console.error(error);
                res.sendStatus(500);
            });
    }
});

app.delete('/destination', async (req, res) => {
    const { id } = req.body;

    deleteDestination(id)
        .then(() => {
            res.status(200);
        })
        .catch((error) => {
            res.status(500);
            console.log('DB delete FAILED')
            console.error(error);
        });
        
    res.send();
});

// Generates an image url for a wishlist item. 
const getImageUrl = (name, location) => {
    const unsplashUrl = 'https://api.unsplash.com/search/photos/';
    const query = `?client_id=${process.env.ACCESS_KEY}&query=${name.toLowerCase()} ${location.toLowerCase()}`;
    const apiUrl = unsplashUrl + query;

    return new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk.toString();
            });
            res.on('end', () => {
                try {
                    const results = JSON.parse(data).results;
                    const rand = Math.floor(Math.random() * results.length);
                    if (results[rand] && results[rand].urls.small.length) {
                        resolve(results[rand].urls.small);
                    } else { 
                        reject('Image URL fetch FAILED - URL length is 0 (invalid)');
                    }
                } catch(error) {
                    console.log('Image URL fetch FAILED');
                    reject(error);
                }
            });
        }).on('error', (error) => {
            console.log('Image URL fetch FAILED');
            reject(error);
        });
    });
};

// Database Read, Update, and Delete Functions
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

const editDescription = async (description, id) => (
    Destination.findOneAndUpdate(
        {
            _id: new ObjectId(id)
        },
        {
            description: description
        }
    )
);

const deleteDestination = async (id) => (
    Destination.findOneAndDelete(
        {
            _id: new ObjectId(id) 
        }
    )
);

module.exports = app;