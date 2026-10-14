
const ActivityModel = require("./Activity.js");
const CommentModel = require("./Comment.js");
const ProjectModel = require("./Projects.js");
const TaskModel = require("./Task.js");

function initializeModels(collection) {
    return {
        Project: new ProjectModel(collection.projects),
        Task: new TaskModel(collection.tasks),
        Comment: new CommentModel(collection.comments),
        Activity: new ActivityModel(collection.activities)
    }
}
module.exports={initializeModels}