const { verfyToken } = require("../middleware/auth.js");

function activityRoute(app, controllers) {
    const ActivityController = controllers.activity;

    // post activity route 
    app.post('/activities', (req, res) => {
        ActivityController.postActivity(req,res)
    })

    // get the activity route 
    app.get('/projects/:projectId/activities', verfyToken, (req, res) => {
        ActivityController.getActivtiy(req, res);
    })
}
module.exports = activityRoute;