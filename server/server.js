const path = require('path');
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const client = path.join(__dirname, '..', 'client');

app.use(bodyParser.json());
app.use('/', express.static(client));

app.post('/wishlist', async (req, res) => {
    const { name, location } = req.body;

    await getImageUrl(name, location)
        .then(url => {
            return res.send({
                url: url
            });
        })
        .catch(error => {
            res.status(500).send(error);
        });
});

app.put('/wishlist', async (req, res) => {
    const { name, location } = req.body;

    await getImageUrl(name, location)
        .then(url => {
            return res.send({
                url: url
            });
        })
        .catch(error => {
            res.status(500).send(error);
        });
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
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
            })
        }).on('error', (error) => {
            reject(error);
        });
    });
};