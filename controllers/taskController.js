class TaskController{
    constructor(models, collection) {
        this.Task = models.Task;
        this.collection=collection
    }
    // post or create Task 
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

    // get task data 
    async getAllTasks(req, res) {
        try {
            const searchText = req.query.searchText;
            const result = await this.Task.findAllTasks(searchText)
            res.send(result);
        }
        catch (error) {
            res.status(500).send({
                message: 'Error getting tasks'
            });
        }
    
    }
    
    // delete task data 
    async deleteTask(req, res) {
        try {
            const id = req.params.id;
            const result = await this.Task.Delete(id);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({messgae:'Error Deleting the Task'})
        }
    }
}

module.exports = TaskController