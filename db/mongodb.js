const MongoClient = require('mongodb').MongoClient;

class MongoConnection {
    
    static async openConnection() {
        if (this.db) {
            return this.db;
        }
        this.db = await MongoClient.connect(process.env.MONGO_CONNECTION_KEY, { useUnifiedTopology: true })
            .then((client) => {
                this.db = client.db('vacation');
                console.log('Connected to Databse');
                return this.db;
            })
            .catch((error) => {
                console.log('Failed to connect to the database');
                console.error(error);
                return null;
            });
    }

}

MongoConnection.db = null;

module.exports = { MongoConnection };
