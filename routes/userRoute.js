const { verfyToken, verifyAdmin } = require("../middleware/auth.js");

function UserRoute(app, controllers) {
    const UserController = controllers.user;

    // post user route 
    app.post('/users', verfyToken, (req, res) =>{ 
        UserController.postUser(req,res)
    })

    // get all user 
    app.get('/users', verfyToken, verifyAdmin, (req, res) => {
        UserController.getAllUser(req, res);
    })

    // update user role 
    // Update user role (admin only)
    app.patch('/users/:id/role', verfyToken, verifyAdmin, (req, res) => UserController.updateUserRole(req, res));


    // get user role 
    // Get logged-in user's role
    app.get('/users/role', verfyToken, (req, res) =>
        UserController.getUserRole(req, res)
    );

    // delete user 
    // Delete user (admin only)
    app.delete('/users/:id', verfyToken, verifyAdmin, (req, res) =>
        UserController.deleteUser(req, res)
    );

}
module.exports = UserRoute;