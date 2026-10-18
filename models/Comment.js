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
        // const query = { taskId: new ObjectId(taskId) };
        const pipline = [
            {
                $match: {
                    taskId: new ObjectId(taskId)
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "user"
                }
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    taskId: 1,
                    content: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    "user._id": 1,
                    "user.name": 1,
                    "user.photoURL": 1,
                    "user.email": 1
                }
            },
            {
                $sort: {
                    createdAt: 1
                }
            }
        ]
        const result = await this.collection.agrregate(pipline).toArray();
        return result;
    }
}
module.exports = CommentModel;