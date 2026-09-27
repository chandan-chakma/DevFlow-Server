const ProjectController = require("./projectController.js");

function initializeControllers(models, collection) {
    return {
        project:new ProjectController(models,collection)
    }
}
module.exports={initializeControllers}