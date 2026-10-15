function UserRoute(app, controllers) {
    const UserController = controllers.user;

    // post user route 
    app.post('/users', (req, res) =>{ 
        UserController.postUser(req,res)
    })
}
module.exports = UserRoute;