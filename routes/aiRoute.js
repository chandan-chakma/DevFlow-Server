const { verfyToken, verifyProjectManager } = require("../middleware/auth.js");

function aiRoute(app, controllers) {
    const AIController = controllers.ai;

    app.post('/projects/:id/ai/generate-tasks',verfyToken,verifyProjectManager, (req, res) => {
        AIController.generateTasks(req, res);
    });
}

module.exports = aiRoute;