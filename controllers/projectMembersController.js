class ProjectMembersController{
    constructor(models, collection) {
        this.ProjectMembers = models.ProjectMembers;
        this.Notification = models.Notification;
        this.collection=collection
    }
    // add member or post Member 
    async postMember(req, res) {
        try {
            const { projectId, userId } = req.body;
            // Identify the person adding the member
            const actor = await this.collection.users.findOne({
                email: req.token_email
            });

            if (!actor) {
                return res.status(404).send({
                    message: "Current user not found"
                });
            }
            const result = await this.ProjectMembers.createMember(projectId, userId);
            if (result.insertedId) {
                const project = await this.collection.projects.findOne({
                    _id: new (require("mongodb").ObjectId)(projectId)
                });

                const newMember = await this.collection.users.findOne({
                    _id: new (require("mongodb").ObjectId)(userId)
                });

                // Notify the newly added member, unless they added themselves
                if (
                    project &&
                    newMember &&
                    actor._id.toString() !== newMember._id.toString()
                ) {
                    await this.Notification.createNotification({
                        recipientId: newMember._id,
                        actorId: actor._id,
                        projectId: project._id,
                        taskId: null,
                        type: "project_member_added",
                        message: `You have been added to the project: ${project.name}`
                    });
                }
            }
            
            res.send(result);
        }
        catch (error) {
            return res.status(500).send({message:'Error adding Project member'})
        }
    }

    // get the meber data 
    async getMembersByProjectId(req, res) {
        try {
            const { projectId } = req.params;
            const members = await this.ProjectMembers.findMembersByProjectId(projectId);
            res.send(members)
            
        }
        catch (error) {
            res.status(500).send({message:'Can no get member'})
        }
        
    }

    // Promote a project member to manager
    async updateMemberRole(req, res) {
        try {
            const { projectId, userId } = req.params;
            const { role } = req.body;

            if (role !== 'manager') {
                return res.status(400).send({
                    message: 'Invalid project role'
                });
            }

            const result = await this.ProjectMembers.updateMemberRole(
                projectId,
                userId,
                role
            );

            if (result.matchedCount === 0) {
                return res.status(404).send({
                    message: 'Project member not found'
                });
            }

            res.send({
                message: 'Member promoted to manager successfully'
            });

        } catch (error) {
            console.error('Update project member role error:', error);
            res.status(500).send({
                message: 'Failed to update project member role'
            });
        }
    }


    // Get logged-in user's role in a specific project
    async getUserRole(req, res) {
        try {
            const { projectId } = req.params;

            // Find the logged-in user
            const user = await this.collection.users.findOne({
                email: req.token_email
            });

            if (!user) {
                return res.status(404).send({
                    message: 'User not found'
                });
            }

            // Find the user's membership in this project
            const membership = await this.collection.projectMembers.findOne({
                projectId: new (require('mongodb').ObjectId)(projectId),
                userId: user._id
            });

            if (!membership) {
                return res.status(404).send({
                    message: 'You are not a member of this project'
                });
            }

            res.send({
                role: membership.role
            });

        } catch (error) {
            console.error('Get project role error:', error);
            res.status(500).send({
                message: 'Failed to get project role'
            });
        }
    }

    
}
module.exports=ProjectMembersController