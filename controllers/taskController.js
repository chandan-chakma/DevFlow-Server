class TaskController{
    constructor(models, collection) {
        this.Task = models.Task;
        this.collection=collection
    }
    // post or create Task 
    async postTask(req, res) {
        try {
            const id = req.params.id;
            // console.log('Project ID:', req.params.id);
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

    // get project spcific task 
    async getTaskByProject(req, res) {
        try {
            const projectId = req.params.id;
            const result = await this.Task.findTaskByProject(projectId);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({message:'Error getting project tasks'})
        }
    }

    // get task data 
    async getAllTasks(req, res) {
        try {
            const searchText = req.query.searchText;
            const status = req.query.status;
            const priority = req.query.priority;
            const sort = req.query.sort;
            const result = await this.Task.findAllTasks(searchText, status, priority,sort);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({
                message: 'Error getting tasks'
            });
        }
    
    }

    // update task data 
    async updatedTask(req, res) {
        try {
            const id = req.params.id;
            const taskData = req.body;
            const result = await this.Task.updateTask(id, taskData);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({ message: 'Error updating task' })
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