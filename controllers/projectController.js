class ProjectController {
    constructor(models, collection) {
        this.Project = models.Project;
        this.Activity = models.Activity;
        this.collection = collection;
    }
        // Post Projects 
    async postProject(req, res) {
        try {
            const projectData = req.body;
            // save project post 
            const result = await this.Project.createProject(projectData);
            // get newly project id 
            const projectId = result.insertedId;
            // 3. Save an activity record
            await this.Activity.createActivity({
                projectId: projectId,
                taskId: null,
                action: "created",
                entityType: "project",
                description: `Created a new project: ${projectData.name}`,
                performedBy: {
                    userId: req.user?.uid || "unknown",
                    name: req.user?.name || "A team member"
                }
            });
            
            res.send(result);
        }
        catch (error) {
            res.status(500).send({messgae:'Error creating project'})
        }
    }

    // Get ALL Project 
    async getAllProjects(req, res) {
        try {
            const searchText = req.query.searchText;
            const status = req.query.status; 
            const sorting = req.query.sort;


            const result = await this.Project.findAllProjects(searchText,status,sorting);
            res.send(result)
            
        }
        catch (error) {
            res.status(500).send({ messgae: 'Error getting project' })
        }
    }

    // Get single project by id 
    async getProjectById(req, res) {
        try {
            const id = req.params.id;
            const project = await this.Project.findById(id);
            res.send(project)
        }
        catch (error) {
            res.status(500).send({message:'Error getting Project'})
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