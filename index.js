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
const notificationRoute = require('./routes/notificationRoute.js');
const startTaskReminderJob = require('./jobs/taskReminder.js');
// socket io import 
const http = require('http');
const { Server } = require('socket.io');
const { setIo } = require('./config/socket.js');
const { ObjectId } = require('mongodb');
const teamRoute = require('./routes/teamRoute.js');
const DashboardRoute = require('./models/dashboardRoute.js');
const { attachCollections } = require('./middleware/collections.js');

const app = express();
const server = http.createServer(app)
const port = process.env.PORT || 3000;

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
});
// set socket 
setIo(io);
// setup socket io with auth 
io.use((socket, next) => {
    try {
        const cookieHeader = socket.handshake.headers.cookie || '';
        // console.log(cookieHeader);
        const tokenCookie = cookieHeader.split('; ').find((cookie) => cookie.startsWith('token='));
        if (!tokenCookie) {
            return next(new Error('Authentication required'))
        }

        const token = decodeURIComponent(tokenCookie.slice('token='.length));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded.email) {
            return next(new Error('Invalid authentication token'));
        }
        socket.userEmail = decoded.email;
        next();
    }
    catch (error) {
        next(new Error('invalid or expried authentication token'))
    }
    
})

// check soket connected 
// io.on('connection', (socket) => {
//     console.log('Socket connected:', socket.id);

//     socket.on('disconnect', () => {
//         console.log('Socket disconnected:', socket.id);
//     });
// });
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
        app.use(attachCollections(collection));
        // Initialize models
        const models = initializeModels(collection);
        // check socket and put authenticate user private room 

        io.on('connection', (socket) => {
            console.log('🟢 New socket connection:', socket.id);

            // Temporary debugging: log events received by this socket
            socket.onAny((eventName, ...args) => {
                console.log('📨 Event received:', eventName, args[0] ?? '');
            });

            // Join a project room
            socket.on('join-project', async (projectId, callback) => {
                try {
                    console.log('📥 join-project event received:', projectId);

                    // Validate project ID
                    if (
                        typeof projectId !== 'string' ||
                        !/^[a-fA-F0-9]{24}$/.test(projectId)
                    ) {
                        return callback?.({
                            success: false,
                            message: 'Invalid project ID',
                        });
                    }

                    // Get authenticated user from the verified socket token
                    const user = await models.User.findUserByEmail(
                        socket.userEmail
                    );

                    if (!user) {
                        return callback?.({
                            success: false,
                            message: 'Authenticated user not found',
                        });
                    }

                    // Verify that the project exists
                    const projectObjectId = new ObjectId(projectId);

                    const project = await collection.projects.findOne({
                        _id: projectObjectId,
                    });

                    if (!project) {
                        return callback?.({
                            success: false,
                            message: 'Project not found',
                        });
                    }

                    // Verify project membership
                    const membership = await collection.projectMembers.findOne({
                        projectId: projectObjectId,
                        userId: user._id,
                    });

                    console.log('🔎 Project membership:', {
                        userId: user._id.toString(),
                        projectId,
                        membershipFound: !!membership,
                    });

                    if (!membership) {
                        return callback?.({
                            success: false,
                            message: 'You are not a member of this project',
                        });
                    }

                    // Join the project-specific room
                    const projectRoom = `project:${projectId}`;

                    await socket.join(projectRoom);

                    console.log('✅ Socket joined project room:', {
                        socketId: socket.id,
                        room: projectRoom,
                        rooms: [...socket.rooms],
                    });

                    callback?.({
                        success: true,
                        room: projectRoom,
                    });
                } catch (error) {
                    console.error(
                        '❌ Failed to join project room:',
                        error.message
                    );

                    callback?.({
                        success: false,
                        message: 'Unable to join project room',
                    });
                }
            });

            // Leave a project room
            socket.on('leave-project', (projectId) => {
                if (
                    typeof projectId !== 'string' ||
                    !/^[a-fA-F0-9]{24}$/.test(projectId)
                ) {
                    return;
                }

                const projectRoom = `project:${projectId}`;

                socket.leave(projectRoom);

                console.log('🚪 Socket left project room:', {
                    socketId: socket.id,
                    room: projectRoom,
                });
            });

            // Handle socket disconnection
            socket.on('disconnect', (reason) => {
                console.log('🔴 Socket disconnected:', {
                    socketId: socket.id,
                    reason,
                });
            });

            // Set up the private notification room asynchronously
            (async () => {
                try {
                    const user = await models.User.findUserByEmail(
                        socket.userEmail
                    );

                    if (!user) {
                        console.log('❌ Socket rejected: user not found');
                        socket.disconnect(true);
                        return;
                    }

                    // Join the user's private room for notifications
                    const roomName = `user:${user._id.toString()}`;

                    await socket.join(roomName);

                    console.log('🔔 Joined private user room:', {
                        socketId: socket.id,
                        room: roomName,
                    });
                } catch (error) {
                    console.error(
                        '❌ Socket connection setup failed:',
                        error.message
                    );

                    socket.disconnect(true);
                }
            })();
        });

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
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
                path: '/',
                maxAge: 60 * 60 * 1000
            });
            res.send({ success: true });

        })

        // Initialize controllers
        const controllers = initializeControllers(models, collection);
        // remmider overdue task 
        startTaskReminderJob(collection, models.Notification);

        // Register routes
        projectRoutes(app, controllers);
        TaskRoute(app, controllers);
        commentRoute(app, controllers);
        activityRoute(app, controllers);
        UserRoute(app, controllers);
        ProjectMemberRoute(app, controllers);
        notificationRoute(app, controllers);
        teamRoute(app, controllers);
        DashboardRoute(app, controllers);


        app.get('/', (req, res) => {
            res.send('hello word')
        });

        // app.listen(port, () => {
        //     console.log(`Example app liste on port ${port}`)
        // })
        server.listen(port, () => {
            console.log(`DevFlow server listening on port ${port}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
    
}

startServer();
