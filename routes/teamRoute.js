const { verfyToken } = require("../middleware/auth.js");

function teamRoute(app, controllers) {
    const TeamController = controllers.team;

    app.get("/team/summary", verfyToken, (req, res) => {
        TeamController.getTeamSummary(req, res);
    });
}

module.exports = teamRoute;