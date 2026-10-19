const ActivityController = require("./activityController.js");
const CommentController = require("./commentController.js");
const NotificatonController = require("./notificationController.js");
const ProjectController = require("./projectController.js");
const ProjectMembersController = require("./projectMembersController.js");
const TaskController = require("./taskController.js");
const UserController = require("./userController.js");

function initializeControllers(models, collection) {
    return {
        project: new ProjectController(models, collection),
        task: new TaskController(models, collection),
        comment: new CommentController(models, collection),
        activity: new ActivityController(models, collection),
        user: new UserController(models, collection),
        projectMember: new ProjectMembersController(models, collection),
        notification:new NotificatonController(models,collection)
    }
}
module.exports={initializeControllers}