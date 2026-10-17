class ProjectMembersController{
    constructor(models, collection) {
        this.ProjectMembers = models.ProjectMembers;
        this.collection=collection
    }
    // add member or post Member 
    async postMember(req, res) {
        try {
            const { projectId, userId } = req.body;
            const result = await this.ProjectMembers.createMember(projectId, userId);
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