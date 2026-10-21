const { ObjectId } = require("mongodb")

class NotificationModel{
    constructor(collection) {
        this.collection=collection
    }

    // now cerate notification 
    async createNotification(notificationData) {
        notificationData.recipientId = new ObjectId(notificationData.recipientId);
        notificationData.actorId = new ObjectId(notificationData.actorId);

        notificationData.projectId = notificationData.projectId
            ? new ObjectId(notificationData.projectId)
            : null;

        notificationData.taskId = notificationData.taskId
            ? new ObjectId(notificationData.taskId)
            : null;

        notificationData.isRead = false;
        notificationData.createdAt = new Date();

        const result = await this.collection.insertOne(notificationData);

        // 2. Build the complete notification, including its MongoDB ID
        const savedNotification = {
            ...notificationData,
            _id: result.insertedId,
        };
        // 3. Send notification to the recipient's private room
        try {
            const io = getIo();
            const roomName = `user:${notificationData.recipientId.toString()}`;

            io.to(roomName).emit('notification', savedNotification);
        } catch (error) {
            console.error('Real-time notification delivery failed:', error.message);
        }
        return result;
    }

    // now we will get or notify only user who geto to not to notify recipientId
    async findNotificationByUser(recipientId) {
        const query = { recipientId: new ObjectId(recipientId) };
        const result = await this.collection.find(query).sort({ createdAt: -1 }).limit(5).toArray();
        return result;
    }


    // mark read notification 
    async markAsRead(notificationId, recipientId) {
        const query = {
            _id: new ObjectId(notificationId),
            recipientId: new ObjectId(recipientId)
        }
        const updateDoc = {
            $set:{isRead:true}
        }
        const result = await this.collection.updateOne(query, updateDoc);
        return result;
    }
    
}
module.exports = NotificationModel;