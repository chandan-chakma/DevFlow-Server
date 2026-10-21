
const cron = require("node-cron");
const { ObjectId } = require("mongodb");

function startTaskReminderJob(collection, Notification) {
    // Run once every hour, at minute 0
    cron.schedule("0 * * * *", async () => {
        console.log("Checking task deadlines...");

        try {
            const tasks = await collection.tasks.find({
                assignedTo: { $exists: true, $ne: null },
                dueDate: { $exists: true, $ne: "" }
            }).toArray();

            // Use UTC calendar dates so comparisons are consistent
            const now = new Date();
            const today = now.toISOString().slice(0, 10);

            const tomorrowDate = new Date(now);
            tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
            const tomorrow = tomorrowDate.toISOString().slice(0, 10);

            for (const task of tasks) {
                // Skip completed tasks
                if (
                    ["completed", "done"].includes(
                        String(task.status || "").toLowerCase()
                    )
                ) {
                    continue;
                }

                // Your dueDate is stored as a date string, e.g. "2026-10-21"
                const dueDate = String(task.dueDate).slice(0, 10);

                if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
                    console.log("Skipping task with invalid dueDate:", task._id);
                    continue;
                }

                let reminderType;
                let message;

                if (dueDate === tomorrow) {
                    reminderType = "due_tomorrow";
                    message = `Reminder: Your task "${task.title}" is due tomorrow.`;
                } else if (dueDate < today) {
                    reminderType = "overdue";
                    message = `Your task "${task.title}" is overdue. Please update its status.`;
                } else {
                    continue;
                }

                // Prevent sending the same type of reminder more than once
                const reminderField =
                    reminderType === "due_tomorrow"
                        ? "reminders.dueTomorrowSentAt"
                        : "reminders.overdueSentAt";

                // Claim this reminder before creating the notification.
                // This prevents repeated hourly runs from sending duplicates.
                const claim = await collection.tasks.updateOne(
                    {
                        _id: task._id,
                        [reminderField]: { $exists: false },
                        status: { $nin: ["completed", "done"] }
                    },
                    {
                        $set: { [reminderField]: new Date() }
                    }
                );

                if (claim.modifiedCount !== 1) {
                    continue;
                }

                try {
                    await Notification.createNotification({
                        recipientId: task.assignedTo,
                        // Notification model requires an actorId.
                        actorId: task.createdBy || task.assignedTo,
                        projectId: task.projectId,
                        taskId: task._id,
                        type: `task_${reminderType}`,
                        message
                    });

                    console.log(
                        `Sent ${reminderType} reminder for task ${task._id}`
                    );
                } catch (notificationError) {
                    // Allow the next scheduled run to retry if creation fails
                    await collection.tasks.updateOne(
                        { _id: task._id },
                        { $unset: { [reminderField]: "" } }
                    );

                    throw notificationError;
                }
            }
        } catch (error) {
            console.error("Task reminder job failed:", error);
        }
    });

    console.log("Task reminder job scheduled.");
}

module.exports = startTaskReminderJob;
