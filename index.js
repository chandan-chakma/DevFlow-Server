const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectToMongoDB } = require('./config/db.js');
const { initializeModels } = require('./models');
const { initializeControllers } = require('./controllers');

// Routes
const projectRoutes = require('./routes/projectRoute');
const TaskRoute = require('./routes/taskRoute.js');
const commentRoute = require('./routes/commentRoute.js');
const activityRoute = require('./routes/activityRoute.js');
const UserRoute = require('./routes/userRoute.js');
const ProjectMemberRoute = require('./routes/projectMemberRoute.js');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const port = process.env.PORT || 3000;

// middleware 
app.use(cors({
        origin: 'http://localhost:5173',
        credentials: true
}))
app.use(express.json())
// https only cookies 
app.use(cookieParser());


async function startServer() {
    try {
        // connect database 
        const { collection } = await (connectToMongoDB());
        // console.log("connected to the mongodb")
        // Initialize models
        const models = initializeModels(collection);
        // post jwt token
        app.post('/getToken', (req, res) => {
            const logUser = req.body;
            console.log(logUser);
            const token = jwt.sign(logUser, process.env.JWT_SECRET, {
                expiresIn:'1h'
            })
            console.log("toke", token)
            res.cookie('token', token,{
                httpOnly: true,
                ecure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
                maxAge: 60 * 60 * 1000
            });
            res.send({ success: true });

        })

        // Initialize controllers
        const controllers = initializeControllers(models, collection);

        // Register routes
        projectRoutes(app, controllers);
        TaskRoute(app, controllers);
        commentRoute(app, controllers);
        activityRoute(app, controllers);
        UserRoute(app, controllers);
        ProjectMemberRoute(app,controllers)

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
