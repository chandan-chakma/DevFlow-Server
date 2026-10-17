function ProjectMemberRoute(app,controllers){
    const ProjectMembersController = controllers.projectMember;

    // post or add member 
    app.post('/project-members', (req, res) => {
        ProjectMembersController.postMember(req,res)
    })

    // get the member of specific projecct 
    app.get('/project-members/:projectId', (req, res) => {
        ProjectMembersController.getMembersByProjectId(req,res)
    })
}
module.exports = ProjectMemberRoute;