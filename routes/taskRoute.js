function TaskRoute(app, controllers) {
    const TaskController = controllers.task;

    // post taska  
    app.post('/projects/:id/tasks', (req, res) => {
        TaskController.postTask(req,res)
    })

    // get task for specific project 
    app.get('/projects/:id/tasks', (req, res) => {
        TaskController.getTaskByProject(req,res)
    })

    // get all task 
    app.get('/tasks', (req, res) => {
        TaskController.getAllTasks(req, res);
    })

    // Update task 
    app.patch('/tasks/:id', (req, res) => {
        TaskController.updatedTask(req,res)
    })

    // delete task data 
    app.delete('/tasks/:id', (req, res) => {
        TaskController.deleteTask(req, res);
    })
}
module.exports = TaskRoute;