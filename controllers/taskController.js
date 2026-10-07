class TaskController{
    constructor(models, collection) {
        this.Task = models.Task;
        this.collection=collection
    }

    async postTask(req, res) {
        try {
            const id = req.params.id;
            console.log('Project ID:', req.params.id);
            const taskData = req.body;
            taskData.projectId = id;
            const result = await this.Task.createTask(taskData);
            res.send(result)
        }
        catch (error) {
            console.log(error)
            res.status(500).send({message:'Error creating Task'})
        }
    }
}

module.exports = TaskController