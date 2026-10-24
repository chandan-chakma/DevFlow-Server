const { act } = require("react");
const { getIo } = require("../config/socket.js");

class TaskController{
    constructor(models, collection) {
        this.Task = models.Task;
        this.Activity = models.Activity;
        this.Notification = models.Notification;
        this.collection=collection
    }
    // post or create Task 
    async postTask(req, res) {
        try {
            const id = req.params.id;
            // console.log('Project ID:', req.params.id);
            const taskData = req.body;
            taskData.projectId = id;
            const actor = await this.collection.users.findOne({
                email: req.token_email
            });

            if (!actor) {
                return res.status(404).send({
                    message: "Authenticated user not found"
                });
            }
            // for notificaton add who create task 
            taskData.createdBy = actor._id;
            const result = await this.Task.createTask(taskData);
            // Emit the newly created task to project members
          
            // Create notification only when a task is assigned
            if (taskData.assignedTo && taskData.assignedTo !== "Unassigned" && taskData.assignedTo.toString() !== actor._id.toString()) {
                await this.Notification.createNotification({
                    recipientId: taskData.assignedTo,
                    actorId: actor._id,
                    projectId: id,
                    taskId: result.insertedId,
                    type: "task_assigned",
                    message: `You have been assigned a task: ${taskData.title}`
                });
            }
            // 2. Record the activity
            await this.Activity.createActivity({
                projectId: id,
                taskId: result.insertedId,
                action: "created",
                entityType: "task",
                description: `Created a new task: ${taskData.title}`,
                taskTitle: taskData.title,
                performedBy: {
                    userId: actor._id || "unknown",
                    name: actor.displayName || "A team member"
                }
            });
            try {
                const createdTask = await this.Task.findTaskById(
                    result.insertedId.toString()
                );

                if (createdTask) {
                    const io = getIo();
                    const projectRoom = `project:${id}`;
                    // console.log('📤 Emitting task-created:', {
                    //     projectRoom,
                    //     taskId: createdTask._id.toString(),
                    // });
                    // console.log(
                    //     '👥 Sockets currently in project room:',
                    //     [...(await io.in(projectRoom).allSockets())]
                    // );


                    io.to(projectRoom).emit('task-created', createdTask);
                }
            } catch (socketError) {
                console.error(
                    'Failed to emit task creation:',
                    socketError.message
                );
            }

            res.send(result)
        }
        catch (error) {
            // console.log(error)
            res.status(500).send({message:'Error creating Task'})
        }
    }

    // get project spcific task 
    async getTaskByProject(req, res) {
        try {
            const projectId = req.params.id;
            const searchText = req.query.searchText;
            const priority = req.query.priority;
            const sort = req.query.sort;
            const result = await this.Task.findTaskByProject(projectId,searchText,priority,sort);
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
            // get thet task before updateing 
            const existingTask = await this.Task.findTaskById(id);
            if (!existingTask) {
                return res.status(404).send({message:'task not found'})
            }
            const actor = await this.collection.users.findOne({
                email: req.token_email
            });

            if (!actor) {
                return res.status(404).send({
                    message: "Authenticated user not found"
                });
            }
            
            // updata task
            const result = await this.Task.updateTask(id, taskData);
            // Emit the updated task to everyone in the same project
            try {
                const updatedTask = await this.Task.findTaskById(id);
                // console.log("Update result:", result);
                // console.log("Updated task from MongoDB:", updatedTask);

                if (updatedTask) {
                    const io = getIo();
                    const projectRoom = `project:${updatedTask.projectId.toString()}`;

                    io.to(projectRoom).emit('task-updated', updatedTask);
                    // console.log("📢 Task update emitted to:", projectRoom);
                }
            } catch (socketError) {
                console.error('Failed to emit task update:', socketError.message);
            }

            if (
                taskData.status &&
                taskData.status !== existingTask.status &&
                existingTask.createdBy.toString() !== actor._id.toString()
            ) {
                await this.Notification.createNotification({
                    recipientId: existingTask.createdBy,
                    actorId: actor._id,
                    projectId: existingTask.projectId,
                    taskId: existingTask._id,
                    type: "task_status_changed",
                    message: `${actor.displayName || "A team member"} changed the status of your task "${existingTask.title}" to ${taskData.status}`
                });
                await this.Activity.createActivity({
                    projectId: existingTask.projectId,
                    taskId: existingTask._id,
                    action: "status",
                    entityType: "task",
                    description: `Changed task status from ${existingTask.status} to ${taskData.status}`,
                    taskTitle: existingTask.title,
                    status: taskData.status,
                    performedBy: {
                        userId: actor._id || "unknown",
                        name: actor.displayName || "A team member"
                    }
                });
            }
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

            // console.log("🗑️ Delete request received:", id);

            const task = await this.Task.findTaskById(id);

            if (!task) {
                // console.log("❌ Task not found:", id);
                return res.status(404).send({
                    message: "Task not found"
                });
            }

            // console.log("✅ Task found:", {
            //     taskId: task._id.toString(),
            //     projectId: task.projectId.toString()
            // });

            const result = await this.Task.Delete(id);

            // console.log("📦 Delete database result:", result);

            if (result.deletedCount !== 1) {
                return res.status(404).send({
                    message: "Task not found"
                });
            }

            await this.Activity.createActivity({
                projectId: task.projectId,
                taskId: task._id,
                action: "deleted",
                entityType: "task",
                description: `Deleted task: ${task.title}`,
                taskTitle: task.title,
                performedBy: {
                    userId: req.user?.uid || "unknown",
                    name: req.user?.name || "A team member"
                }
            });

            const io = getIo();
            const projectRoom = `project:${task.projectId.toString()}`;

            // console.log("📤 Emitting task-deleted:", {
            //     projectRoom,
            //     taskId: task._id.toString(),
            //     sockets: await io.in(projectRoom).fetchSockets()
            //         .then(sockets => sockets.map(socket => socket.id))
            // });

            io.to(projectRoom).emit("task-deleted", {
                taskId: task._id.toString()
            });

            return res.send(result);
        } catch (error) {
            console.error("❌ Error deleting task:", error);
            return res.status(500).send({
                message: "Error deleting the task"
            });
        }
    }
}

module.exports = TaskController