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

    // get task data 
    async findAllTasks(searchText = null) {
        const query={}
        if (searchText) {
            query.title = {
                $regex: searchText,
                $options:'i'
            }
        }
        const pipeline = [
            {
                $match: query
        },
        
            {
                $lookup: {
                    from: "projects",
                    localField: "projectId",
                    foreignField: "_id",
                    as: "project"
                }
            },
            {
                $unwind: "$project"
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    status: 1,
                    priority: 1,
                    dueDate: 1,
                    projectId: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    projectName: "$project.name"
                }
            }
        ];

        const cursor = this.collection.aggregate(pipeline)
        const result = await cursor.toArray();
        return result;
    }

    async Delete(id) {
        const query = { _id: new ObjectId(id) }
        const result = await this.collection.deleteOne(query)
        return result;
    }
}
module.exports=TaskModel