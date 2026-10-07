const ProjectController = require("./projectController.js");
const TaskController = require("./taskController.js");

function initializeControllers(models, collection) {
    return {
        project: new ProjectController(models, collection),
        task: new TaskController(models,collection)
    }
}
module.exports={initializeControllers}