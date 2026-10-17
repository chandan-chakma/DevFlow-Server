const { ObjectId } = require("mongodb");

class TaskModel{
    constructor(collection) {
        this.collection = collection;
    }

    // Create Task post 
    async createTask(taskData) {
        taskData.projectId = new ObjectId(taskData.projectId);
        if (taskData.assignedTo) {
            taskData.assignedTo = new ObjectId(taskData.assignedTo);
        }
        taskData.createdAt = new Date();
        taskData.updatedAt = new Date()
        const result = await this.collection.insertOne(taskData);
        return result;
    }
    // get specifc project task 
    async findTaskByProject(projectId, searchText = null, priority = null, sort ='due-latest') {
        const query = { projectId: new ObjectId(projectId) }
        if (searchText) {
            query.title = {
                $regex: searchText,
                $options:'i'
            }
        }
        if (priority) {
            query.priority=priority
        }
        let sortOption = {};

        if (sort === 'due-latest') {
            sortOption = { dueDate: -1 };
        }

        if (sort === 'due-earliest') {
            sortOption = { dueDate: 1 };
        }
        const pipeline = [
            {
                $match: query
            },
            {
                $sort: sortOption
            },
            {
                $lookup: {
                    from: "users",
                    localField: "assignedTo",
                    foreignField: "_id",
                    as: "assignee"
                }
            },
            {
                $unwind: {
                    path: "$assignee",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    status: 1,
                    priority: 1,
                    dueDate: 1,
                    projectId: 1,
                    assignedTo: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    assignee: {
                        _id: "$assignee._id",
                        name: "$assignee.name",
                        email: "$assignee.email",
                        photoURL: "$assignee.photoURL",
                        role: "$assignee.role"
                    }
                }
            }
        ];

        const result = await this.collection.aggregate(pipeline).toArray();
        return result;
        
    }

    // get task data 
    async findAllTasks(searchText = null, status = null, priority =null,sort='latest') {
        const query={}
        if (searchText) {
            query.title = {
                $regex: searchText,
                $options:'i'
            }
        }
        if (status) {
            query.status = status;
        }
        let sortOption = {};
        if (sort === 'latest') {
            sortOption = { createdAt: -1 };
        }
        if (sort === 'oldest') {
            sortOption = { createdAt: 1 };
        }

        if (sort === 'due-asc') {
            sortOption = { dueDate: 1 };
        }

        if (priority) {
            query.priority = priority;
        }
        const pipeline = [
            {
                $match: query
            },
            {
                $sort: sortOption
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

    // get task by id 
    async findTaskById(id) {
        return await this.collection.findOne({
            _id: new ObjectId(id)
        });
    }

    async updateTask(id, updateData) {
        const query = { _id: new ObjectId(id) };
        if (updateData.assignedTo) {
            updateData.assignedTo = new ObjectId(updateData.assignedTo);
        }
        const updateDoc = {
            $set: updateData
        };
        return await this.collection.updateOne(query, updateDoc);
    }

    async Delete(id) {
        const query = { _id: new ObjectId(id) }
        const result = await this.collection.deleteOne(query)
        return result;
    }
}
module.exports=TaskModel