class ProjectModel {
    constructor(collection) {
        this.collection=collection
    }

    async createProject(projectData) {
        projectData.createdAt = new Date();
        const result = await this.collection.insertOne(projectData);
        return result;
    }

    // async findAllProject()
}
module.exports = ProjectModel;