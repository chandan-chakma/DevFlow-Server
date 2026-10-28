const { verfyToken } = require("../middleware/auth.js");

function DashboardRoute(app, controller) {
    const DashboardController = controller.dashboard;

    app.get("/dashboard/summary",verfyToken,
        DashboardController.getSummary.bind(DashboardController)
    );

    app.get("/dashboard/overview-chart",verfyToken,
        DashboardController.getOverviewChart.bind(DashboardController)
    );

    app.get("/dashboard/task-status-chart",verfyToken,DashboardController.getTaskStatus.bind(DashboardController)
    );

}
module.exports = DashboardRoute;