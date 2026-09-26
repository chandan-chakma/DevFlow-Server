const { MongoClient, ServerApiVersion} = require('mongodb'); //mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l05lfvs.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function connectToMongoDB() {
    try {
        await client.connect();
        const db = client.db('DevFLowDB');

        console.log("You successfully connected to MongoDB!");
        return {
            db,
            collection: {
                users: db.collection('users'),
                projects:db.collection('projects')

            }
            
        };
    } catch (err) {
        console.dir(err);
        throw err;
    }
}

module.exports ={connectToMongoDB,client}