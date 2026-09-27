class ProjectController {
    constructor(models, collection) {
        this.Project = models.Project;
        this.collection = collection;
    }

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
}
module.exports = ProjectController;