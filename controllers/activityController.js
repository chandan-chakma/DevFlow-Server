class ActivityController{
    constructor(models, collection) {
        this.Activity = models.Activity;
        this.collection = collection;
    }

    // post activity 
    async postActivity(req, res) {
        try {
            const activityData = req.body;
            const result = await this.Activity.createActivity(activityData);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({messges:'Faild to Create Activity'})
        }
    }

    async getActivtiy(req, res) {
        try {
            const { projectId } = req.params;
            const result = await this.Activity.findActivity(projectId).limit(10);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({message:'Failed to get project activities'})
        }
    }


    async getUserActivities(req, res) {
        try {
            // 1. Find the authenticated user
            const user = await this.collection.users.findOne({
                email: req.token_email
            });

            if (!user) {
                return res.status(404).send({
                    message: "User not found"
                });
            }

            // 2. Find the projects this user belongs to
            const memberships = await this.collection.projectMembers
                .find({ userId: user._id })
                .toArray();

            const projectIds = [
                ...new Map(
                    memberships.map(member => [
                        member.projectId.toString(),
                        member.projectId
                    ])
                ).values()
            ];

            if (projectIds.length === 0) {
                return res.send([]);
            }

            // 3. Fetch activities from those projects
            let activities =
                await this.Activity.findActivitiesByProjects(projectIds);

            // 4. Optionally filter by activity type
            const filter = req.query.filter || "all";

            const isMyActivity = activity =>
                activity.performedBy?.userId?.toString() ===
                user._id.toString();

            if (filter === "my") {
                activities = activities.filter(isMyActivity);
            } else if (filter === "team") {
                activities = activities.filter(
                    activity => !isMyActivity(activity)
                );
            }

            // 5. Return the activities
            res.send(activities);
        } catch (error) {
            console.error("Error getting user activities:", error);

            res.status(500).send({
                message: "Failed to get user activities"
            });
        }
    }

}
module.exports = ActivityController;