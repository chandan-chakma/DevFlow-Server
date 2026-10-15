class CommentController{
    constructor(models, collection) {
        this.Comment = models.Comment;
        this.Activity = models.Activity;
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

            const result = await this.Comment.createComment(commentData);

            // 2. Find the task to get its project ID and title
            const task = await this.collection.tasks.findOne({
                _id: new (require("mongodb").ObjectId)(id)
            });

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
                        userId: req.user?.uid || "unknown",
                        name: req.user?.name || "A team member"
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