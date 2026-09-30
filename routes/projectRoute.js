function projectRoutes(app, controllers) {
    const ProjectController = controllers.project;

    // Post Project Route 
    app.post('/projects', (req, res) => {
        ProjectController.postProject(req,res)
    })

    // Get project Route 
    app.get('/projects', (req, res)=>{
        ProjectController.getAllProjects(req,res)
    })

    // project delete route 
    app.delete('/projects/:id', (req, res) => {
        ProjectController.deleteProject(req,res)
    })
}
module.exports =projectRoutes