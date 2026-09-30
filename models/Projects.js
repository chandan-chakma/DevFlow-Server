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
    async findAllProjects() {
        const cursor = this.collection.find()
        return await cursor.toArray();
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