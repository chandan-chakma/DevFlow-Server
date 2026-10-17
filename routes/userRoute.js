function UserRoute(app, controllers) {
    const UserController = controllers.user;

    // post user route 
    app.post('/users', (req, res) =>{ 
        UserController.postUser(req,res)
    })

    // get all user 
    app.get('/users', (req, res) => {
        UserController.getAllUser(req, res);
    })
}
module.exports = UserRoute;