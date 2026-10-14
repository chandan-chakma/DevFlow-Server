const { ObjectId } = require("mongodb");

class ActivityModel{
    constructor(collection) {
        this.collection = collection;
    }
    // create or post Activity 
    async createActivity(activityData) {
        activityData.projectId = new ObjectId(activityData.projectId);
        activityData.taskId = activityData.taskId
            ? new ObjectId(activityData.taskId)
            : null;
        activityData.createdAt = new Date();
        const result = await this.collection.insertOne(activityData);
        return result;
    }

    // get tthe activity 
    async findActivity(projectId) {
        const query = {
            projectId: new ObjectId(projectId)
        }
        const result = await this.collection.find(query).sort({ createdAt: -1 }).toArray();
        return result;
    }

}
module.exports = ActivityModel;