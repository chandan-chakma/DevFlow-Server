function projectRoutes(app, controllers) {
    const ProjectController = controllers.project;

    app.post('/projects', (req, res) => {
        ProjectController.postProject(req,res)
    })
}
module.exports =projectRoutes