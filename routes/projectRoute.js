const { verfyToken, verifyAdmin } = require("../middleware/auth.js");

function projectRoutes(app, controllers) {
    const ProjectController = controllers.project;

    // Post Project Route 
    app.post('/projects',verfyToken, (req, res) => {
        ProjectController.postProject(req,res)
    })

    // Get project Route 
    app.get('/projects',verfyToken, (req, res)=>{
        ProjectController.getAllProjects(req,res)
    })
    // get signle project route 
    app.get('/projects/:id', verfyToken, (req, res) => {
        ProjectController.getProjectById(req,res)
        
    }) 

    // project delete route 
    app.delete('/projects/:id', verfyToken, verifyAdmin, (req, res) => {
        ProjectController.deleteProject(req,res)
    })
}
module.exports =projectRoutes