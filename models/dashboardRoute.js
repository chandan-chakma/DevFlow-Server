const { verfyToken } = require("../middleware/auth.js");

function DashboardRoute(app, controller) {
    const DashboardController = controller.dashboard;

    app.get("/dashboard/summary",verfyToken,
        DashboardController.getSummary.bind(DashboardController)
    );

}
module.exports = DashboardRoute;