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


    async getTeamMembers(req, res) {
        try {
            // 1. Find the currently authenticated user
            const currentUser = await this.collection.users.findOne({
                email: req.token_email
            });

            if (!currentUser) {
                return res.status(404).send({
                    message: "User not found"
                });
            }

            // 2. Find projects the current user belongs to
            const myMemberships = await this.collection.projectMembers
                .find({ userId: currentUser._id })
                .toArray();

            const myProjectIds = [
                ...new Map(
                    myMemberships.map(member => [
                        member.projectId.toString(),
                        member.projectId
                    ])
                ).values()
            ];

            if (myProjectIds.length === 0) {
                return res.send([]);
            }

            // 3. Find members who share those projects
            const memberships = await this.collection.projectMembers
                .find({ projectId: { $in: myProjectIds } })
                .toArray();

            // Deduplicate members across multiple projects
            const memberIds = [
                ...new Map(
                    memberships
                        .filter(member =>
                            member.userId.toString() !==
                            currentUser._id.toString()
                        )
                        .map(member => [
                            member.userId.toString(),
                            member.userId
                        ])
                ).values()
            ];

            if (memberIds.length === 0) {
                return res.send([]);
            }

            // 4. Fetch member profiles
            const users = await this.collection.users
                .find({ _id: { $in: memberIds } })
                .toArray();

            // 5. Get project and task data
            const [projects, tasks] = await Promise.all([
                this.collection.projects
                    .find({ _id: { $in: myProjectIds } })
                    .toArray(),

                this.collection.tasks
                    .find({ projectId: { $in: myProjectIds } })
                    .toArray()
            ]);

            const projectMap = new Map(
                projects.map(project => [
                    project._id.toString(),
                    project
                ])
            );

            const now = new Date();

            // 6. Build each member's dashboard data
            const teamMembers = users.map(user => {
                const userMemberships = memberships.filter(
                    member =>
                        member.userId.toString() === user._id.toString()
                );

                const memberProjectIds = [
                    ...new Set(
                        userMemberships.map(member =>
                            member.projectId.toString()
                        )
                    )
                ];

                const memberProjects = memberProjectIds
                    .map(id => projectMap.get(id))
                    .filter(Boolean);

                const memberTasks = tasks.filter(
                    task =>
                        task.assignedTo?.toString() ===
                        user._id.toString()
                );

                const completed = memberTasks.filter(task =>
                    ["Done", "Completed"].includes(task.status)
                ).length;

                const unfinishedTasks = memberTasks.filter(
                    task =>
                        !["Done", "Completed"].includes(task.status)
                );

                const overdue = unfinishedTasks.filter(task => {
                    if (!task.dueDate) return false;

                    const dueDate = new Date(task.dueDate);

                    // Include the whole day for date-only due dates
                    if (
                        typeof task.dueDate === "string" &&
                        /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate)
                    ) {
                        dueDate.setHours(23, 59, 59, 999);
                    }

                    return (
                        !Number.isNaN(dueDate.getTime()) &&
                        dueDate < now
                    );
                }).length;

                return {
                    id: user._id,
                    name: user.displayName || user.name || user.email,
                    email: user.email,
                    role: user.role || "Member",
                    avatar: user.photoURL || "",
                    projects: memberProjects.map(project => ({
                        id: project._id,
                        name: project.name
                    })),
                    openTasks: unfinishedTasks.filter(
                        task => task.status === "To Do"
                    ).length,
                    inProgress: unfinishedTasks.filter(
                        task => task.status === "In Progress"
                    ).length,
                    completed,
                    overdue,
                    online: false
                };
            });

            res.send(teamMembers);
        } catch (error) {
            console.error("Error getting team members:", error);

            res.status(500).send({
                message: "Error getting team members"
            });
        }
    }

}

module.exports = TeamController;
