class UserController{
    constructor(models, collection) {
        this.User = models.User;
        this.collection = collection;
    }
    // now post user or create user data 
    async postUser(req, res) {
        try {
            const user = req.body
            const result = await this.User.createUser(user);
            res.send(result);
        }
        catch (error) {
            // console.log(error)
            res.status(500).send({message:'Error creating user'})
        }
        

    }
}
module.exports = UserController;