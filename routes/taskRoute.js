function TaskRoute(app, controllers) {
    const TaskController = controllers.task;

    app.post('/projects/:id/tasks', (req, res) => {
        TaskController.postTask(req,res)
    })
}
module.exports = TaskRoute;