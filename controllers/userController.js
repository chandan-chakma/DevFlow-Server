class UserController{
    constructor(models, collection) {
        this.User = models.User;
        this.collection = collection;
    }
    // now post user or create user data 
    async postUser(req, res) {
        try {
            const user = req.body;
            const email = user.email;
            // check user email user is already register or not
            const userExist = await this.User.existUser(email);
            if (userExist) {
                return res.status(409).send({message:'This email is already use.'})
            }
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