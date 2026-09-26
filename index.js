const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToMongoDB } = require('./config/db.js');

const app = express();
const port = process.env.PORT || 3000;

// middleware 
app.use(cors())
app.use(express.json())

async function startServer() {
    try {
        // connect database 
        const { collection } = await (connectToMongoDB());
        console.log("connected to the mongodb")

        app.get('/', (req, res) => {
            res.send('hello word')
        });

        app.listen(port, () => {
            console.log(`Example app liste on port ${port}`)
        })
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
    
}

startServer();
