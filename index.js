const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToMongoDB } = require('./config/db.js');
const { initializeModels } = require('./models');
const { initializeControllers } = require('./controllers');

// Routes
const projectRoutes = require('./routes/projectRoute');
const TaskRoute = require('./routes/taskRoute.js');


const app = express();
const port = process.env.PORT || 3000;

// middleware 
app.use(cors())
app.use(express.json())

async function startServer() {
    try {
        // connect database 
        const { collection } = await (connectToMongoDB());
        // console.log("connected to the mongodb")
        // Initialize models
        const models = initializeModels(collection);

        // Initialize controllers
        const controllers = initializeControllers(models, collection);

        // Register routes
        projectRoutes(app, controllers);
        TaskRoute(app,controllers)

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
