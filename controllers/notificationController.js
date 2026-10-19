class NotificatonController{
    constructor(models,collection) {
        this.Notification = models.Notification;
        this.User = models.User;
        this.collection = collection;
    }
    // create notification 
    async postNotification(req, res) {
        try {
            const notificationData = req.body;
            const result = await this.Notification.createNotification(notificationData);
            res.send(result);
        }
        catch (error) {
            return res.status(500).send({message:'Failed to create notifications'})
        }
    }

    // now get the notification for who get the notification

    async getNotification(req, res) {
        try {
            console.log("Token email:", req.token_email);

            const user = await this.User.findUserByEmail(req.token_email);

            console.log("Found user:", user);

            if (!user) {
                return res.status(404).send({
                    message: "User not found"
                });
            }

            const notifications =
                await this.Notification.findNotificationByUser(user._id);

            return res.send(notifications);

        } catch (error) {
            console.error("Get notification error:", error);

            return res.status(500).send({
                message: "Failed to get notifications"
            });
        }
    }
}
module.exports = NotificatonController;