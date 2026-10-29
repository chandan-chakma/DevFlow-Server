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

    // get all user 
    async getAllUser(req, res) {
        try {
            const users = await this.User.findAllUser();
            res.send(users);
        }
        catch (error) {
            return res.status(500).send({message:'Faild to get User'})
        }
    }

    // updated user role 
    async updateUserRole(req, res) {
        try {
            const id = req.params.id;
            const roleInfo = req.body;
            const result = await this.User.updateRole(id, roleInfo.role);
            res.send(result);
        } catch (error) {
            res.status(500).send({ message: 'Error updating user role', error: error.message });
        }
    }


    // get user role 
    // Get logged-in user's role
    async getUserRole(req, res) {
        try {
            const email = req.token_email;

            const user = await this.User.findUserByEmail(email);

            if (!user) {
                return res.status(404).send({
                    message: 'User not found'
                });
            }

            res.send({ role: user.role || 'user' });
        } catch (error) {
            res.status(500).send({
                message: 'Failed to get user role'
            });
        }
    }
}
module.exports = UserController;