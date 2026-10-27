const { verfyToken } = require("../middleware/auth.js");

function activityRoute(app, controllers) {
    const ActivityController = controllers.activity;

    // post activity route 
    app.post('/activities',verfyToken, (req, res) => {
        ActivityController.postActivity(req,res)
    })

    // Get activities related to the authenticated user 
    app.get(
        "/activities",
        verfyToken,
        (req, res) => ActivityController.getUserActivities(req, res)
    );

    // get the activity route  project wise acitivity
    app.get('/projects/:projectId/activities', verfyToken, (req, res) => {
        ActivityController.getActivtiy(req, res);
    })
}
module.exports = activityRoute;