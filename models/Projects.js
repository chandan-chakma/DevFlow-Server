const { ObjectId } = require("mongodb");

class ProjectModel {
    constructor(collection) {
        this.collection=collection
    }
        // Post Project 
    async createProject(projectData) {
        projectData.createdAt = new Date();
        const result = await this.collection.insertOne(projectData);
        return result;
    }; 

    // Get All Project 
    async findAllProjects(searchText = null,status=null,sort={createdAt:-1}) {
        const query = {};
        if (searchText) {
            query.name = {
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

        if (sort === 'name-asc') {
            sortOption = { name: 1 };
        }

        if (sort === 'name-desc') {
            sortOption = { name: -1 };
        }
        const pipeline = [
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$_id',
                    count: 1
                }
            }
        ];


        const projects =await this.collection.find(query).sort(sortOption).toArray();
        const statusCounts = await this.collection.aggregate(pipeline).toArray()
        const total = await this.collection.countDocuments();
        return {
            projects,
            total,
            statusCounts
            
        }
    }

    // find single project 
    async findById(id) {
        const query = { _id: new ObjectId(id) };
        return await this.collection.findOne(query);
    }
    


    // Delete Project 
    async delete(id) {
        const query = { _id: new ObjectId(id) };
        const result = await this.collection.deleteOne(query);
        return result;
    }

    

    // async findAllProject()
}
module.exports = ProjectModel;