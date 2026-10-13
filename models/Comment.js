const { ObjectId } = require("mongodb");

class CommentModel{
    constructor(collection) {
        this.collection = collection;
    }

    // now post comment 
    async createComment(commentData) {
        commentData.taskId = new ObjectId(commentData.taskId);
        commentData.createdAt = new Date();
        commentData.updatedAt = new Date();
        const result = await this.collection.insertOne(commentData);
        return result;
    }
    // get comment 
    async findTaskcomments(taskId) {
        const query = { taskId: new ObjectId(taskId) };
        const result = await this.collection.find(query).sort({ createdAt: 1 }).toArray();
        return result;
    }
}
module.exports = CommentModel;