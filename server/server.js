const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const https = require('https');
const { getDestination, saveDestination, editDestination, editDescription, deleteDestination } = require('../db/mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const clientPath = path.join(__dirname, '..', 'client');
const defaultImgUrl = 'https://c.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif';

app.use(bodyParser.json());
app.use('/', express.static(clientPath));

app.get('/wishlist', async (req, res) => {
    await getDestination()
        .then((destinations) => {
            res.status(200);
            res.send(destinations);
            console.log('DB read successful');
        })
        .catch((error) => {
            res.sendStatus(500);
            console.log('DB read FAILED');
            console.error(error);
        })
});

app.post('/wishlist', async (req, res) => {
    const { name, location, description } = req.body;
    const info = {};

    await getImageUrl(name, location)
        .then((url) => {
            info.url = url;
            info.imgFetchSuccessful = true;
            console.log('Image URL fetch successful');
        })
        .catch((error) => {
            info.url = defaultImgUrl;
            info.imgFetchSuccessful = false;
            console.log('Image URL fetch FAILED');
            console.error(error);
        });

    await saveDestination(name, location, description, info.url)
        .then((id) => {
            info.id = id;
            res.status(201);
            console.log('DB write successful');
        })
        .catch((error) => {
            res.status(500);
            console.log('DB write FAILED');
            console.error(error);
        });
        
    res.send(info);
});

app.put('/wishlist', async (req, res) => {
    const { name, location, description, id } = req.body;
    const info = {};

    await getImageUrl(name, location)
        .then((url) => {
            info.url = url;
            info.imgFetchSuccessful = true;
            console.log('Image URL fetch successful');
        })
        .catch((error) => {
            info.url = defaultImgUrl;
            info.imgFetchSuccessful = false;
            console.log('Image URL fetch FAILED');
            console.error(error);
        });

    await editDestination(name, location, description, info.url, id)
        .then(() => {
            res.status(201);
            console.log('DB edit successful');
        })
        .catch((error) => {
            res.status(500);
            console.log('DB edit FAILED');
            console.error(error);
        });

    res.send(info);
});

app.put('/description', async (req, res) => {
    const { id, description } = req.body;

    await editDescription(description, id)
    .then(() => {
        res.sendStatus(201);
        console.log('DB edit successful');
    })
    .catch((error) => {
        res.sendStatus(500);
        console.log('DB edit FAILED');
        console.error(error);
    });
})

app.delete('/wishlist', async (req, res) => {
    const { id } = req.body;

    await deleteDestination(id)
        .then((result) => {
            res.status(200);
            console.log('DB delete successful');
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
                    if (results[rand].urls.small.length) {
                        resolve(results[rand].urls.small)
                    } else { 
                        reject('URL length is 0 (invalid)');
                    }
                } catch(error) {
                    reject(error);
                }
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
};

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});