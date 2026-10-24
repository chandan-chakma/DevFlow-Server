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
            // Get the authenticated user
            const email = req.token_email;

            if (!email) {
                return res.status(401).send({
                    message: "Authentication required",
                });
            }

            const user = await this.collection.users.findOne({ email });

            if (!user) {
                return res.status(404).send({
                    message: "User not found",
                });
            }
            // save project post 
            const result = await this.Project.createProject(projectData);
            // get newly project id 
            const projectId = result.insertedId;
            // Automatically add the creator to projectMembers
            await this.collection.projectMembers.updateOne(
                {
                    projectId: projectId,
                    userId: user._id,
                },
                {
                    $setOnInsert: {
                        projectId: projectId,
                        userId: user._id,
                        joinedAt: new Date(),
                    },
                },
                { upsert: true }
            );
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
            // 1. Get project details before deletion
            const project = await this.Project.findById(id);
            if (!project) {
                return res.status(404).send({
                    message: "Project not found"
                });
            }
            const result = await this.Project.delete(id);
            // 3. Record deletion activity
            if (result.deletedCount === 1) {
                await this.Activity.createActivity({
                    projectId: project._id,
                    taskId: null,
                    action: "deleted",
                    entityType: "project",
                    description: `Deleted project: ${project.name}`,
                    performedBy: {
                        userId: req.user?.uid || "unknown",
                        name: req.user?.name || "A team member"
                    }
                });
            }

            res.send(result);
        }
        catch(error) {
            res.status(500).send({messge:'error deleting projcect'})
        }
    }
}
module.exports = ProjectController;