class TeamController {
    constructor(models, collection) {
        this.User = models.User;
        this.Project = models.Project;
        this.Task = models.Task;
        this.ProjectMembers = models.ProjectMembers;

        this.collection = collection;
    }

    async getTeamSummary(req, res) {
        try {
            // verfyToken sets this from the JWT cookie.
            const email = req.token_email;

            if (!email) {
                return res.status(401).send({
                    message: "Unauthorized access"
                });
            }

            const user = await this.collection.users.findOne({ email });

            if (!user) {
                return res.status(404).send({
                    message: "User not found"
                });
            }

            // Find projects where the current user is a member.
            const memberships = await this.collection.projectMembers
                .find({ userId: user._id })
                .toArray();

            // Remove duplicate project IDs.
            const projectIdsMap = new Map();

            memberships.forEach((member) => {
                projectIdsMap.set(
                    member.projectId.toString(),
                    member.projectId
                );
            });

            const projectIds = [...projectIdsMap.values()];

            if (projectIds.length === 0) {
                return res.send({
                    totalMembers: 0,
                    activeTasks: 0,
                    overdueTasks: 0,
                    totalProjects: 0
                });
            }

            // Get all memberships for these projects.
            const projectMemberships = await this.collection.projectMembers
                .find({
                    projectId: { $in: projectIds }
                })
                .toArray();

            // Count unique collaborators, excluding the current user.
            const collaboratorIds = new Set();

            projectMemberships.forEach((member) => {
                if (member.userId) {
                    const memberId = member.userId.toString();

                    if (memberId !== user._id.toString()) {
                        collaboratorIds.add(memberId);
                    }
                }
            });

            // Get tasks belonging to the user's projects.
            const tasks = await this.collection.tasks
                .find({
                    projectId: { $in: projectIds }
                })
                .toArray();

            // Match the task statuses used in DevFlow.
            const completedStatuses = ["Done", "Completed"];

            const unfinishedTasks = tasks.filter(
                (task) => !completedStatuses.includes(task.status)
            );

            // Count all unfinished tasks in these projects.
            const activeTasks = unfinishedTasks.length;

            // Count unfinished tasks whose due date has passed.
            const now = new Date();

            const overdueTasks = unfinishedTasks.filter((task) => {
                if (!task.dueDate) return false;

                const dueDate = new Date(task.dueDate);

                if (Number.isNaN(dueDate.getTime())) {
                    return false;
                }

                // If dueDate is date-only, consider the task overdue
                // after the end of that calendar day.
                if (
                    typeof task.dueDate === "string" &&
                    /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)
                ) {
                    dueDate.setHours(23, 59, 59, 999);
                }

                return dueDate < now;
            }).length;

            return res.send({
                totalMembers: collaboratorIds.size,
                activeTasks,
                overdueTasks,
                totalProjects: projectIds.length
            });

        } catch (error) {
            console.error("Team summary error:", error);

            return res.status(500).send({
                message: "Failed to get team summary"
            });
        }
    }
}

module.exports = TeamController;
