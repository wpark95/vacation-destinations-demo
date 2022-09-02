const path = require('path');
const express = require('express');
const https = require('https');
const bodyParser = require('body-parser');
const { MongoConnection } = require('../db/mongodb');
const { ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const clientPath = path.join(__dirname, '..', 'client');
const defaultImgUrl = 'https://c.tenor.com/_4YgA77ExHEAAAAd/rick-roll.gif';
MongoConnection.openConnection();

app.use(bodyParser.json());
app.use('/', express.static(clientPath));

app.post('/wishlist', async (req, res) => {
    const { name, location } = req.body;
    const info = {};

    await getImageUrl(name, location)
        .then((url) => {
            info.url = url;
        })
        .catch((error) => {
            info.url = defaultImgUrl;
            info.error = error;
            res.status(500);
        });

    await addDestination(name, location, info.url)
        .then(({ insertedId }) => {
            console.log('MongoDB add operation successful');
            info.id = insertedId.toString();
            res.status(200);
        })
        .catch((error) => {
            info.error = error;
            res.status(500);
        });
    res.send(info);
});

app.put('/wishlist', async (req, res) => {
    const { name, location, id } = req.body;
    const info = {};

    await getImageUrl(name, location)
        .then((url) => {
            info.url = url;
        })
        .catch((error) => {
            info.url = defaultImgUrl;
            info.error = error;
            res.status(500);
        });

    await editDestination(name, location, info.url, id)
        .then((result) => {
            console.log('MongoDB edit operation successful');
            res.status(200);
        })
        .catch((error) => {
            info.error = error;
            res.status(500);
        });
    res.send(info);
});

app.delete('/wishlist', async (req, res) => {
    const { id } = req.body;

    await deleteDestination(id)
        .then((result) => {
            console.log('MongoDB delete operation successful');
            res.status(200);
        })
        .catch((error) => {
            console.log(error);
            res.status(500);
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
                    if (rand && results[rand].urls.small.length) {
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


const addDestination = async (name, location, imageUrl) => {
    const mongoCollection = MongoConnection.db.collection('wishlist');

    return await mongoCollection.insertOne(
        {
            name: name,
            location: location,
            image: imageUrl,
        })
            .then((result) => {
                return result;
            })
            .catch((error) => {
                return error;
            });
};

const editDestination = async (name, location, imageUrl, id) => {
    const mongoCollection = MongoConnection.db.collection('wishlist');

    return await mongoCollection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
            $set: 
            {
                name: name,
                location: location,
                image: imageUrl,
            }
        },
        {
            upsert: true
        })
            .then((result) => {
                return result;
            })
            .catch((error) => {
                return error;
            });
};

const deleteDestination = async (id) => {
    const mongoCollection = MongoConnection.db.collection('wishlist');

    return await mongoCollection.deleteOne(
        { _id: new ObjectId(id) }
    )
        .then((result) => {
            return result;
        })
        .catch((error) => {
            return error;
        });
}

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});