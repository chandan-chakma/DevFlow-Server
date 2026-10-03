
const ProjectModel = require("./Projects.js");
const TaskModel = require("./Task.js");

function initializeModels(collection) {
    return {
        Project: new ProjectModel(collection.projects),
        Task: new TaskModel(collection.tasks)
    }
}
module.exports={initializeModels}