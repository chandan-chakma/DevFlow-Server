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
            const result = await this.Activity.findActivity(projectId);
            res.send(result);
        }
        catch (error) {
            res.status(500).send({message:'Failed to get project activities'})
        }
    }
}
module.exports = ActivityController;