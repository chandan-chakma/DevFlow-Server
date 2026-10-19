const { verfyToken } = require("../middleware/auth.js");

function notificationRoute(app, controllers) {
    const NotificatonController = controllers.notification;

    // create project 
    app.post('/notification',verfyToken,(req, res) => {
        NotificatonController.postNotification(req, res);
    });

    app.get('/notifications', verfyToken,(req, res) => {
        NotificatonController.getNotification(req,res);
    })
}
module.exports= notificationRoute;