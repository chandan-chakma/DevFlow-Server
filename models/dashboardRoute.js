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

    // get recent project route 
    app.get("/dashboard/recent-projects",verfyToken,
        DashboardController.getRecentProjects.bind(DashboardController)
    );

    // get my 5 task 
    app.get( "/dashboard/my-recent-tasks",verfyToken,
       DashboardController.getMyRecentTasks.bind(DashboardController)
    );

    // get recent activity 
    app.get("/dashboard/recent-activities",verfyToken,
        DashboardController.getRecentActivities.bind(DashboardController)
    );

}
module.exports = DashboardRoute;