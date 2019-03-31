var secrets = require("../config/secrets");

module.exports = function(router) {
  var homeRoute = router.route("/");
  homeRoute.get(function(req, res) {
    var connectionString = secrets.token;
    res.json({
      message: "My connection string is " + connectionString
    });
  });

  const crud = require("../crud/crud");

  var usersRoute = router.route("/users");
  usersRoute.get(crud.findUsers);
  usersRoute.post(crud.createUser);

  var userRoute = router.route("/users/:id");
  userRoute.get(crud.findUserById);
  userRoute.put(crud.updateUserById);
  userRoute.delete(crud.deleteUserById);

  var tasksRoute = router.route("/tasks");
  tasksRoute.get(crud.findTasks);
  tasksRoute.post(crud.createTask);

  var taskRoute = router.route("/tasks/:id");
  taskRoute.get(crud.findTaskById);
  taskRoute.put(crud.updateTaskById);
  taskRoute.delete(crud.deleteTaskById);

  return router;
};
