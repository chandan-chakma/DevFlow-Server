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
}
module.exports=ProjectMembersController