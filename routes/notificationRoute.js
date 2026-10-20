const { verfyToken } = require("../middleware/auth.js");

function notificationRoute(app, controllers) {
    const NotificatonController = controllers.notification;

    // create project 
    app.post('/notification',verfyToken,(req, res) => {
        NotificatonController.postNotification(req, res);
    });
        // get the notification 
    app.get('/notifications', verfyToken,(req, res) => {
        NotificatonController.getNotification(req,res);
    })

    // updata the notification mark as read 
    app.patch('/notifications/:id/read',verfyToken, (req, res) => {
        NotificatonController.markNotificationAsRead(req, res);
    })
}
module.exports= notificationRoute;