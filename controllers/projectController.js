class ProjectController {
    constructor(models, collection) {
        this.Project = models.Project;
        this.collection = collection;
    }
        // Post Projects 
    async postProject(req, res) {
        try {
            const projectData = req.body;
            const result = await this.Project.createProject(projectData);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({messgae:'Error creating project'})
        }
    }

    // Get ALL Project 
    async getAllProjects(req, res) {
        try {
            const result = await this.Project.findAllProjects();
            res.send(result)
            
        }
        catch (error) {
            res.status(500).send({ messgae: 'Error getting project' })
        }
    }

    // Delete Project 
    async deleteProject(req, res) {
        try {
            const id = req.params.id;
            const result = await this.Project.delete(id);
            res.send(result);
        }
        catch(error) {
            res.status(500).send({messge:'error deleting projcect'})
        }
    }
}
module.exports = ProjectController;