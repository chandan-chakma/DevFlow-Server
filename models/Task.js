const { ObjectId } = require("mongodb");

class TaskModel{
    constructor(collection) {
        this.collection = collection;
    }

    // Create Task post 
    async createTask(taskData) {
        taskData.projectId = new ObjectId(taskData.projectId);
        taskData.createdAt = new Date();
        taskData.updatedAt = new Date()
        const result = await this.collection.insertOne(taskData);
        return result;
    }
}
module.exports=TaskModel