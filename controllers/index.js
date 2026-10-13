const CommentController = require("./commentController.js");
const ProjectController = require("./projectController.js");
const TaskController = require("./taskController.js");

function initializeControllers(models, collection) {
    return {
        project: new ProjectController(models, collection),
        task: new TaskController(models, collection),
        comment:new CommentController(models,collection)
    }
}
module.exports={initializeControllers}