const { verfyToken } = require("../middleware/auth.js");

function commentRoute(app, controllers) {
    const CommentController = controllers.comment;

    // post comment or create Route 
    app.post('/tasks/:id/comments', verfyToken, (req, res) => {
        CommentController.postCommentTask(req,res)
    })

    // get comemment 
    app.get('/tasks/:id/comments', verfyToken, (req, res) => {
        CommentController.getTaskComments(req, res);
    })


}
module.exports = commentRoute;