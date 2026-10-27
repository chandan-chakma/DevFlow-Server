const { verfyToken } = require("../middleware/auth.js");

function TaskRoute(app, controllers) {
    const TaskController = controllers.task;

    // post taska  
    app.post('/projects/:id/tasks', verfyToken, (req, res) => {
        TaskController.postTask(req,res)
    })

    // get task for specific project 
    app.get('/projects/:id/tasks', verfyToken, (req, res) => {
        TaskController.getTaskByProject(req,res)
    })

    // get all task 
    app.get('/tasks', verfyToken, (req, res) => {
        TaskController.getAllTasks(req, res);
    })

    // Update task 
    app.patch('/tasks/:id', verfyToken, (req, res) => {
        TaskController.updatedTask(req,res)
    })

    // delete task data 
    app.delete('/tasks/:id', verfyToken, (req, res) => {
        TaskController.deleteTask(req, res);
    })


    app.get('/my-calendar-tasks', verfyToken, (req, res) => {
        TaskController.getMyCalendarTasks(req, res);
    });
}
module.exports = TaskRoute;