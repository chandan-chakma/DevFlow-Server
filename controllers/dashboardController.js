class DashboardController {
    constructor(models, collection) {
        this.Project = models.Project;
        this.Task = models.Task;

        this.Projects = collection.projects;
        this.Tasks = collection.tasks;
        this.ProjectMembers = collection.projectMembers;
        this.User = collection.users;
    }

    // Get dashboard summary statistics
    async getSummary(req, res) {
        try {
            // Get the authenticated user
            const email = req.token_email;

            const user = await this.User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Date ranges
            const now = new Date();

            // Start of today
            const startOfToday = new Date(now);
            startOfToday.setHours(0, 0, 0, 0);

            // Start of tomorrow
            const startOfTomorrow = new Date(startOfToday);
            startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

            // Start of this week (Monday)
            const startOfWeek = new Date(now);
            startOfWeek.setHours(0, 0, 0, 0);

            const daysSinceMonday = (startOfWeek.getDay() + 6) % 7;
            startOfWeek.setDate(
                startOfWeek.getDate() - daysSinceMonday
            );

            // Start of next week
            const startOfNextWeek = new Date(startOfWeek);
            startOfNextWeek.setDate(startOfNextWeek.getDate() + 7);

            // Start of last week
            const startOfLastWeek = new Date(startOfWeek);
            startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

            // Get projects the user belongs to
            const projectResults = await this.ProjectMembers.aggregate([
                {
                    $match: {
                        userId: user._id
                    }
                },
                {
                    $group: {
                        _id: "$projectId"
                    }
                }
            ]).toArray();

            const projectIds = projectResults.map(
                (project) => project._id
            );

            const totalProjects = projectIds.length;

            // Get all dashboard statistics
            const [
                newProjectsThisWeek,
                totalTasks,
                completedTasks,
                completedToday,
                completedThisWeek,
                completedLastWeek,
                memberResults,
                newMembersThisWeek
            ] = await Promise.all([

                // Projects created this week
                this.Projects.countDocuments({
                    _id: { $in: projectIds },
                    createdAt: {
                        $gte: startOfWeek,
                        $lt: startOfNextWeek
                    }
                }),

                // Total tasks across the user's projects
                this.Tasks.countDocuments({
                    projectId: { $in: projectIds }
                }),

                // Currently completed tasks
                this.Tasks.countDocuments({
                    projectId: { $in: projectIds },
                    status: "Done"
                }),

                // Tasks completed today
                this.Tasks.countDocuments({
                    projectId: { $in: projectIds },
                    status: "Done",
                    completedAt: {
                        $gte: startOfToday,
                        $lt: startOfTomorrow
                    }
                }),

                // Tasks completed this week
                this.Tasks.countDocuments({
                    projectId: { $in: projectIds },
                    status: "Done",
                    completedAt: {
                        $gte: startOfWeek,
                        $lt: startOfNextWeek
                    }
                }),

                // Tasks completed last week
                this.Tasks.countDocuments({
                    projectId: { $in: projectIds },
                    status: "Done",
                    completedAt: {
                        $gte: startOfLastWeek,
                        $lt: startOfWeek
                    }
                }),

                // Unique members across the user's projects
                this.ProjectMembers.aggregate([
                    {
                        $match: {
                            projectId: { $in: projectIds }
                        }
                    },
                    {
                        $group: {
                            _id: "$userId"
                        }
                    }
                ]).toArray(),

                // Unique members who joined this week
                this.ProjectMembers.aggregate([
                    {
                        $match: {
                            projectId: { $in: projectIds },
                            joinedAt: {
                                $gte: startOfWeek,
                                $lt: startOfNextWeek
                            }
                        }
                    },
                    {
                        $group: {
                            _id: "$userId"
                        }
                    }
                ]).toArray()
            ]);

            // Calculate completion percentage change compared
            // with the previous week
            let completedTasksChange = 0;

            if (completedLastWeek === 0) {
                completedTasksChange =
                    completedThisWeek > 0 ? 100 : 0;
            } else {
                completedTasksChange = Math.round(
                    (
                        (completedThisWeek - completedLastWeek) /
                        completedLastWeek
                    ) * 100
                );
            }

            // Send summary response
            return res.status(200).json({
                stats: {
                    totalProjects,
                    totalTasks,
                    completedTasks,
                    totalMembers: memberResults.length,
                    newProjectsThisWeek,
                    completedToday,
                    newMembersThisWeek: newMembersThisWeek.length,
                    completedTasksChange
                }
            });

        } catch (error) {
            console.error(
                "Dashboard summary error:",
                error
            );

            return res.status(500).json({
                message: "Failed to load dashboard summary"
            });
        }
    }
}

module.exports = DashboardController;