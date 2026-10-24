const { getIo } = require("../config/socket.js");

class CommentController{
    constructor(models, collection) {
        this.Comment = models.Comment;
        this.Activity = models.Activity;
        this.Notification = models.Notification;
        this.collection = collection;
    }

    // post comment 
    async postCommentTask(req, res) {
        try {
            const id = req.params.id;
            const commentData = req.body;
            commentData.taskId = id;
            if (!commentData.content || !commentData.content.trim()) {
                return res.status(400).send({
                    message: "Comment content is required"
                });
            }
            // Get the email from the verified JWT
            const email = req.token_email;
            // console.log(email)
            // Find the user in MongoDB
            const user = await this.collection.users.findOne({ email });

            if (!user) {
                return res.status(404).send({
                    message: "User not found"
                });
            }

            commentData.userId = user._id;

            const result = await this.Comment.createComment(commentData);

            // 2. Find the task to get its project ID and title
            const task = await this.collection.tasks.findOne({
                _id: new (require("mongodb").ObjectId)(id)
            });
            // creatae notification 
            if (task) {
                // for connect socket io 
                try {
                    const comments = await this.Comment.findTaskcomments(id);

                    const createdComment = comments.find(
                        comment =>
                            comment._id.toString() === result.insertedId.toString()
                    );

                    if (createdComment) {
                        const io = getIo();
                        const projectRoom = `project:${task.projectId.toString()}`;
                        console.log('📢 Emitting new-comment to room:', projectRoom);
                        console.log('Comment:', createdComment);

                        io.to(projectRoom).emit("new-comment", createdComment);
                    }
                } catch (socketError) {
                    console.error(
                        "Failed to emit new comment:",
                        socketError.message
                    );
                }
                // Collect the task creator and assigned member
                const recipients = [
                    task.createdBy,
                    task.assignedTo
                ].filter(Boolean);

                // Remove duplicate IDs and exclude the person who commented
                const recipientIds = [
                    ...new Set(
                        recipients
                            .map(id => id.toString())
                            .filter(id => id !== user._id.toString())
                    )
                ];

                // Create a notification for each recipient
                for (const recipientId of recipientIds) {
                    await this.Notification.createNotification({
                        recipientId,
                        actorId: user._id,
                        projectId: task.projectId,
                        taskId: task._id,
                        type: "task_commented",
                        message: `${user.displayName || "A team member"} commented on your task: ${task.title}`
                    });
                }
            }

            if (task) {
                // 3. Record the activity
                await this.Activity.createActivity({
                    projectId: task.projectId,
                    taskId: task._id,
                    action: "comment",
                    entityType: "task",
                    description: "Added a comment to a task",
                    taskTitle: task.title,
                    performedBy: {
                        userId: user._id || "unknown",
                        name: user?.displayName || "A team member"
                    }
                });
            }
            res.send(result)
        }
        catch (error) {
            console.log(error)
            res.status(500).send({messagae:'Comment content is required'})
        }
    }

    async getTaskComments(req, res) {
        try {
            const taskId = req.params.id;
            const result = await this.Comment.findTaskcomments(taskId);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({ message:'Failed to retrieve task comments'})
        }
    }
}
module.exports = CommentController;