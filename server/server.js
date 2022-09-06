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

app.get('/wishlist', async (req, res) => {
    const wishlist = await MongoConnection.db.collection('wishlist');
    await wishlist.find().toArray()
        .then((data) => {
            res.status(200);
            res.send(data);
        })
        .catch((error) => {
            res.sendStatus(400);
        })
});

app.post('/wishlist', async (req, res) => {
    const { name, location, description } = req.body;
    const info = {};

    await getImageUrl(name, location)
        .then((url) => {
            console.log('URL fetch successful');
            info.url = url;
            info.imgFetchSuccessful = true;
        })
        .catch((error) => {
            console.log('Error fecting URL for requested image');
            info.url = defaultImgUrl;
            info.imgFetchSuccessful = false;
        });

    await addDestination(name, location, description, info.url)
        .then(({ insertedId }) => {
            console.log('MongoDB add operation successful');
            info.id = insertedId.toString();
            res.status(201);
        })
        .catch((error) => {
            console.log(error);
            res.status(500);
        });
        
    res.send(info);
});

app.put('/wishlist', async (req, res) => {
    const { name, location, description, id } = req.body;
    const info = {};

    await getImageUrl(name, location)
        .then((url) => {
            console.log('URL fetch successful');
            info.url = url;
            info.imgFetchSuccessful = true;
        })
        .catch((error) => {
            console.log('Error fecting URL for requested image');
            info.url = defaultImgUrl;
            info.imgFetchSuccessful = false;
        });

    await editDestination(name, location, description, info.url, id)
        .then((result) => {
            console.log('MongoDB edit operation successful');
            res.status(200);
        })
        .catch((error) => {
            console.log(error);
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

const getAllDestinations = async () => {
    const wishlist = await MongoConnection.db.collection('wishlist');
    
    return await wishlist.find().toArray();
};

const addDestination = async (name, location, description, imageUrl) => {
    const wishlist = MongoConnection.db.collection('wishlist');

    return await wishlist.insertOne(
        {
            name: name,
            location: location,
            description: description,
            image: imageUrl,
        })
            .then((result) => {
                return result;
            })
            .catch((error) => {
                throw error;
            });
};

const editDestination = async (name, location, description, imageUrl, id) => {
    const wishlist = MongoConnection.db.collection('wishlist');

    return await wishlist.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
            $set: 
            {
                name: name,
                location: location,
                description: description,  
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
                throw error;
            });
};

const deleteDestination = async (id) => {
    const wishlist = MongoConnection.db.collection('wishlist');

    return await wishlist.deleteOne(
        { _id: new ObjectId(id) }
    )
        .then((result) => {
            return result;
        })
        .catch((error) => {
            throw error;
        });
};

app.listen(port, () => {
    console.log(`Listening on port ${port}.`);
});