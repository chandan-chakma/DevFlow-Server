const { verfyToken } = require("../middleware/auth.js");

function UserRoute(app, controllers) {
    const UserController = controllers.user;

    // post user route 
    app.post('/users', verfyToken, (req, res) =>{ 
        UserController.postUser(req,res)
    })

    // get all user 
    app.get('/users', verfyToken, (req, res) => {
        UserController.getAllUser(req, res);
    })
}
module.exports = UserRoute;