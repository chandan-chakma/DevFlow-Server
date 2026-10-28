class DashboardController {
    constructor(models, collection) {
        this.Project = models.Project;
        this.Task = models.Task;

        this.Projects = collection.projects;
        this.Tasks = collection.tasks;
        this.ProjectMembers = collection.projectMembers;
        this.User = collection.users;
        // this.Activity = models.Activity;
        this.Activity = models.Activity;
    }

    // Get dashboard summary statistics count
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


    // Get weekly task activity for the overview chart

    async getOverviewChart(req, res) {
        try {
            const email = req.token_email;
            const range = req.query.range || "this-week";

            // Validate the selected date range
            const validRanges = [
                "this-week",
                "last-week",
                "last-30-days"
            ];

            if (!validRanges.includes(range)) {
                return res.status(400).json({
                    message: "Invalid chart date range"
                });
            }

            // Find authenticated user
            const user = await this.User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

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

            // Calculate date range
            const now = new Date();

            const today = new Date(now);
            today.setHours(0, 0, 0, 0);

            let startDate;
            let endDate;
            let numberOfDays;

            if (range === "this-week") {
                // Monday through Sunday of the current week
                startDate = new Date(today);

                const daysSinceMonday =
                    (startDate.getDay() + 6) % 7;

                startDate.setDate(
                    startDate.getDate() - daysSinceMonday
                );

                endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 7);

                numberOfDays = 7;
            } else if (range === "last-week") {
                // Monday through Sunday of the previous week
                endDate = new Date(today);

                const daysSinceMonday =
                    (endDate.getDay() + 6) % 7;

                endDate.setDate(
                    endDate.getDate() - daysSinceMonday
                );

                startDate = new Date(endDate);
                startDate.setDate(startDate.getDate() - 7);

                numberOfDays = 7;
            } else {
                // Today and the previous 29 days
                endDate = new Date(today);
                endDate.setDate(endDate.getDate() + 1);

                startDate = new Date(today);
                startDate.setDate(startDate.getDate() - 29);

                numberOfDays = 30;
            }

            // Fetch tasks created or completed during this range
            const tasks = await this.Tasks.find({
                projectId: { $in: projectIds },
                $or: [
                    {
                        createdAt: {
                            $gte: startDate,
                            $lt: endDate
                        }
                    },
                    {
                        completedAt: {
                            $gte: startDate,
                            $lt: endDate
                        }
                    }
                ]
            }).toArray();

            // Generate chart data
            const chartData = Array.from(
                { length: numberOfDays },
                (_, index) => {
                    const dayStart = new Date(startDate);
                    dayStart.setDate(dayStart.getDate() + index);

                    const dayEnd = new Date(dayStart);
                    dayEnd.setDate(dayEnd.getDate() + 1);

                    const created = tasks.filter((task) =>
                        task.createdAt instanceof Date &&
                        task.createdAt >= dayStart &&
                        task.createdAt < dayEnd
                    ).length;

                    const completed = tasks.filter((task) =>
                        task.status === "Done" &&
                        task.completedAt instanceof Date &&
                        task.completedAt >= dayStart &&
                        task.completedAt < dayEnd
                    ).length;

                    // Show weekdays for weekly ranges,
                    // and calendar dates for the 30-day range
                    const day = range === "last-30-days"
                        ? `${dayStart.getMonth() + 1}/${dayStart.getDate()}`
                        : dayStart.toLocaleDateString("en-US", {
                            weekday: "short"
                        });

                    return {
                        day,
                        created,
                        completed
                    };
                }
            );

            return res.status(200).json({
                chartData
            });

        } catch (error) {
            console.error("Overview chart error:", error);

            return res.status(500).json({
                message: "Failed to load overview chart"
            });
        }
    }

        // show task chart 
    async getTaskStatus(req, res) {
        try {
            const email = req.token_email;

            // Find the logged-in user
            const user = await this.User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Get projects the user belongs to
            const memberships = await this.ProjectMembers
                .find({ userId: user._id })
                .toArray();

            const projectIds = memberships.map(
                (member) => member.projectId
            );

            // Initialize all three statuses to zero
            const statusCounts = {
                "To Do": 0,
                "In Progress": 0,
                "Done": 0
            };

            // Count tasks belonging to those projects
            if (projectIds.length > 0) {
                const results = await this.Tasks.aggregate([
                    {
                        $match: {
                            projectId: { $in: projectIds }
                        }
                    },
                    {
                        $group: {
                            _id: "$status",
                            count: { $sum: 1 }
                        }
                    }
                ]).toArray();

                results.forEach((item) => {
                    if (Object.hasOwn(statusCounts, item._id)) {
                        statusCounts[item._id] = item.count;
                    }
                });
            }

            const taskData = [
                {
                    name: "To Do",
                    value: statusCounts["To Do"],
                    color: "#D9E0F0"
                },
                {
                    name: "In Progress",
                    value: statusCounts["In Progress"],
                    color: "#4F7DF3"
                },
                {
                    name: "Done",
                    value: statusCounts["Done"],
                    color: "#45B89C"
                }
            ];

            return res.status(200).json({ taskData });

        } catch (error) {
            console.error("Task status error:", error);

            return res.status(500).json({
                message: "Failed to load task status"
            });
        }
    }

    // get recent 5 Project
    async getRecentProjects(req, res) {
        try {
            const email = req.token_email;

            const user = await this.User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Find projects the user belongs to
            const memberships = await this.ProjectMembers
                .find({ userId: user._id })
                .toArray();

            const projectIds = memberships.map(
                (member) => member.projectId
            );

            if (projectIds.length === 0) {
                return res.status(200).json({
                    projects: []
                });
            }

            // Fetch the five most recently created projects
            const projects = await this.Projects
                .find({ _id: { $in: projectIds } })
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray();

            return res.status(200).json({ projects });

        } catch (error) {
            console.error("Recent projects error:", error);

            return res.status(500).json({
                message: "Failed to load recent projects"
            });
        }
    }


    // get my first 5 task 
    async getMyRecentTasks(req, res) {
        try {
            const email = req.token_email;

            // Find the logged-in user
            const user = await this.User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Find tasks assigned to this user
            const tasks = await this.Tasks
                .find({
                    assignedTo: user._id
                })
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray();

            return res.status(200).json({
                tasks
            });

        } catch (error) {
            console.error("My recent tasks error:", error);

            return res.status(500).json({
                message: "Failed to load recent tasks"
            });
        }
    }


    // get recent 5 activity 
    async getRecentActivities(req, res) {
        try {
            const email = req.token_email;

            const user = await this.User.findOne({ email });

            if (!user) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            // Find projects the user belongs to
            const memberships = await this.ProjectMembers
                .find({ userId: user._id })
                .toArray();

            const projectIds = memberships.map(
                (member) => member.projectId
            );

            if (projectIds.length === 0) {
                return res.status(200).json({
                    activities: []
                });
            }

            // Fetch the five most recent activities
            const activities = await this.Activity.findActivitiesByProjects(projectIds);

            const recentActivities = activities.slice(0, 5);

            return res.status(200).json({
                activities: recentActivities
            });

        } catch (error) {
            console.error("Recent activities error:", error);

            return res.status(500).json({
                message: "Failed to load recent activities"
            });
        }
    }

}

module.exports = DashboardController;