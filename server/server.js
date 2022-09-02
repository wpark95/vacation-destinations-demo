const path = require('path');
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
// const MongoClient = require('mongodb').MongoClient;
const { MongoConnection } = require('../db/mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const clientPath = path.join(__dirname, '..', 'client');
const defaultImgUrl = 'https://c.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif';

app.use(bodyParser.json());
app.use('/', express.static(clientPath));

MongoConnection.openConnection();

app.post('/wishlist', async (req, res) => {
    const { name, location } = req.body;
    let imageUrl;

    await getImageUrl(name, location)
        .then((url) => {
            imageUrl = url;

            res.status(200).send({
                url: url,
                error: null,
            });
        })
        .catch((error) => {
            res.status(500).send({
                url: defaultImgUrl,
                error: error,
            });
        });

    updateDb('post', name, location, imageUrl);

    return res;
});

app.put('/wishlist', async (req, res) => {
    const { name, location } = req.body;
    let imageUrl;

    await getImageUrl(name, location)
        .then((url) => {
            imageUrl = url;

            res.status(200).send({
                url: url,
                error: null,
            });
        })
        .catch((error) => {
            res.status(500).send({
                url: defaultImgUrl,
                error: error,
            });
        });

    updateDb('put', name, location, imageUrl);

    return res;
});

// Generates an image url for a wishlist item. 
// Automatically uses a photo that matches user-provided name & location. 
// If a matching photo cannot be found, uses a default image.
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
                    rand && results[rand].urls.small.length 
                        ? resolve(results[rand].urls.small)
                        : reject('URL length is 0 (invalid)');
                } catch(error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
};

const updateDb = (method, name, location, imageUrl) => {
    const mongoCollection = MongoConnection.db.collection('wishlist');

    if (method === 'post') {
        mongoCollection.insertOne(
            {
                name: name,
                location: location,
                image: imageUrl,
            })
            .then((result) => {
                console.log(result);
            })
            .catch((error) => {
                console.error(error);
            })
    };
    if (method === 'put') {
        mongoCollection.findOneAndUpdate(
            { name: name },
            {
              $set: {
                name: name,
                location: location,
                image: imageUrl,
              }
            },
            {
              upsert: true
            })
    };

};

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});