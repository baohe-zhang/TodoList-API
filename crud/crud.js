const mongoose = require("mongoose");
const User = mongoose.model("User");
const Task = mongoose.model("Task");
const url = require("url");

exports.findUsers = (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (!parsedUrl.search) {
    // query is empty
    User.find()
      .limit(100)
      .exec()
      .then(docs => {
        res.status(200).json({
          message: "GET OK",
          data: docs
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "Failed to get users",
          data: []
        });
      });
  } else {
    // build query
    let query = User.find();
    if (parsedUrl.query.where)
      query = query.where(JSON.parse(parsedUrl.query.where));
    if (parsedUrl.query.sort)
      query = query.sort(JSON.parse(parsedUrl.query.sort));
    if (parsedUrl.query.select)
      query = query.select(JSON.parse(parsedUrl.query.select));
    if (parsedUrl.query.skip)
      query = query.skip(JSON.parse(parsedUrl.query.skip));
    if (parsedUrl.query.count)
      query = query.count(JSON.parse(parsedUrl.query.count));
    if (parsedUrl.query.limit)
      query = query.limit(JSON.parse(parsedUrl.query.limit));
    else query = query.limit(100);

    // execute query
    query
      .exec()
      .then(docs => {
        if (docs == null || docs.length == 0) {
          res.status(404).json({
            message: "Cannot find users under these conditions",
            data: []
          });
        } else {
          res.status(200).json({
            message: "GET OK",
            data: docs
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          message: "Failed to get users",
          data: []
        });
      });
  }
};

exports.createUser = (req, res) => {
  let user = req.body;

  // check input
  if (user.name == null || user.name == "") {
    res.status(400).json({
      message: "User cannot be created without a name",
      data: []
    });
    return;
  }
  if (user.email == null || user.email == "") {
    res.status(400).json({
      message: "User cannot be created without a email",
      data: []
    });
    return;
  }

  // input is valid, insert the new user into the database
  user = new User(user);
  user
    .save()
    .then(doc => {
      res.status(201).json({
        message: "POST OK",
        data: doc
      });
    })
    .catch(err => {
      if (err.code == 11000) {
        res.status(400).json({
          message: "Email address should be unique",
          data: []
        });
      } else {
        res.status(500).json({
          message: "Failed to create a user",
          data: []
        });
      }
    });
};

exports.findUserById = (req, res) => {
  const userId = req.params.id;
  User.findById(userId)
    .exec()
    .then(doc => {
      if (doc == null) {
        res.status(404).json({
          message: `Cannot find the user with id ${userId}`,
          data: []
        });
      } else {
        res.status(200).json({
          message: "GET OK",
          data: doc
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: `Failed to get the user with id ${userId}`,
        data: []
      });
    });
};

// the tasks in the user's pendingTasks will be updated if the name of the user changed.
exports.updateUserById = (req, res) => {
  const user = req.body;
  if (user.name == null || user.name == "") {
    res.status(400).json({
      message: "User cannot be updated without a name",
      data: []
    });
    return;
  }
  if (user.email == null || user.email == "") {
    res.status(400).json({
      message: "User cannot be updated without a email",
      data: []
    });
    return;
  }

  const userId = req.params.id;
  User.findByIdAndUpdate(userId, { $set: user }, { new: true })
    .exec()
    .then(userDoc => {
      Task.updateMany(
        { assignedUser: userId },
        { assignedUserName: user.name },
        { new: true }
      )
        .exec()
        .then(taskDoc => {
          res.status(200).json({
            message: "PUT OK",
            data: userDoc
          });
        })
        .catch(err => {
          res.status(500).json({
            message: `Failed to update the user with id ${userId}`,
            data: []
          });
        });
    })
    .catch(err => {
      res.status(500).json({
        message: `Failed to update the user with id ${userId}`,
        data: []
      });
    });
};

// the tasks in the user's pendingTasks will be updated to unassigned.
exports.deleteUserById = (req, res) => {
  const userId = req.params.id;
  User.findByIdAndDelete(userId)
    .exec()
    .then(userDoc => {
      if (!userDoc) {
        res.status(404).json({
          message: `Cannot find the user with id ${userId}`,
          data: []
        });
      } else {
        Task.updateMany(
          { assignedUser: userId },
          { assignedUser: "", assignedUserName: "unassigned" },
          { new: true }
        )
          .exec()
          .then(taskDoc => {
            res.status(200).json({
              message: "DELETE OK",
              data: userDoc
            });
          })
          .catch(err => {
            res.status(500).json({
              message: `Failed to delete the tasks of the user with id ${userId}`,
              data: []
            });
          });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: `Failed to delete the user with id ${userId}`,
        data: []
      });
    });
};

exports.findTasks = (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (!parsedUrl.search) {
    // query is empty
    Task.find()
      .limit(100)
      .exec()
      .then(docs => {
        res.status(200).json({
          message: "GET OK",
          data: docs
        });
      })
      .catch(err => {
        res.status(500).json({
          message: "Failed to get tasks",
          data: []
        });
      });
  } else {
    // build query
    let query = Task.find();
    if (parsedUrl.query.where)
      query = query.where(JSON.parse(parsedUrl.query.where));
    if (parsedUrl.query.sort)
      query = query.sort(JSON.parse(parsedUrl.query.sort));
    if (parsedUrl.query.select)
      query = query.select(JSON.parse(parsedUrl.query.select));
    if (parsedUrl.query.skip)
      query = query.skip(JSON.parse(parsedUrl.query.skip));
    if (parsedUrl.query.count)
      query = query.count(JSON.parse(parsedUrl.query.count));
    if (parsedUrl.query.limit)
      query = query.limit(JSON.parse(parsedUrl.query.limit));
    else query = query.limit(100);

    // execute query
    query
      .exec()
      .then(docs => {
        if (docs == null || docs.length == 0) {
          res.status(404).json({
            message: "Cannot find tasks under these conditions",
            data: []
          });
        } else {
          res.status(200).json({
            message: "GET OK",
            data: docs
          });
        }
      })
      .catch(err => {
        res.status(500).json({
          message: "Failed to get tasks",
          data: []
        });
      });
  }
};

// Check the existence of the assigned user first, if the user exists, the user's pendingTasks will be updated,
// otherwise the task will be inserted without an assigned user.
exports.createTask = async (req, res) => {
  let task = req.body;

  // check if the name and deadline is empty
  if (task.name == null || task.name == "") {
    res.status(400).json({
      message: "Task cannot be created without a name",
      data: []
    });
    return;
  }
  if (task.deadline == null || task.deadline == "") {
    res.status(400).json({
      message: "Task cannot be created without a deadline",
      data: []
    });
    return;
  }

  // check if the assigned user exist
  if (task.assignedUser) {
    await User.findById(task.assignedUser)
      .exec()
      .then(doc => {
        if (!doc) {
          task.assignedUser = "";
          task.assignedUserName = "unassigned";
        }
      })
      .catch(err => {
        task.assignedUser = "";
        task.assignedUserName = "unassigned";
      });
  }

  // input is valid, insert the new task into the database
  task = new Task(task);
  task
    .save()
    .then(taskDoc => {
      if (task.assignedUser != "" && !task.completed) {
        User.findByIdAndUpdate(task.assignedUser, {
          $push: { pendingTasks: taskDoc._id }
        })
          .exec()
          .then(userDoc => {
            res.status(201).json({
              message: "POST OK",
              data: taskDoc
            });
          })
          .catch(err => {
            res.status(500).json({
              message: "Failed to assign the new task to the user",
              data: []
            });
          });
      } else {
        res.status(201).json({
          message: "POST OK",
          data: taskDoc
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: "Failed to create a task",
        data: []
      });
    });
};

exports.findTaskById = (req, res) => {
  const taskId = req.params.id;
  Task.findById(taskId)
    .exec()
    .then(doc => {
      if (!doc) {
        res.status(404).json({
          message: `Cannot find the task with id ${taskId}`,
          data: []
        });
      } else {
        res.status(200).json({
          message: "GET OK",
          data: doc
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: `Failed to get the task with id ${taskId}`,
        data: []
      });
    });
};

// user's pendingTasks will be upadted when a incompleted task with user assigned is set to completed
exports.updateTaskById = (req, res) => {
  const task = req.body;
  if (task.name == null || task.name == "") {
    res.status(400).json({
      message: "Task cannot be updated without a name",
      data: []
    });
    return;
  }
  if (task.deadline == null || task.deadline == "") {
    res.status(400).json({
      message: "Task cannot be updated without a deadline",
      data: []
    });
    return;
  }

  const taskId = req.params.id;
  Task.findByIdAndUpdate(taskId, { $set: task }, { new: true })
    .exec()
    .then(taskDoc => {
      if (taskDoc.completed && taskDoc.assignedUser) {
        User.findByIdAndUpdate(taskDoc.assignedUser, {
          $pull: { pendingTasks: taskDoc._id }
        })
          .exec()
          .then(userDoc => {
            res.status(200).json({
              message: "PUT OK",
              data: taskDoc
            });
          })
          .catch(err => {
            res.status(500).json({
              message: `Failed to delete the pendingTasks of task with id ${taskId}`,
              data: []
            });
          });
      } else {
        res.status(200).json({
          message: "PUT OK",
          data: taskDoc
        });
      }
    })
    .catch(err => {
      res.status(500).json({
        message: `Failed to update the task with id ${taskId}`,
        data: []
      });
    });
};

// user's pendingTasks will be upadted when a incompleted task with user assigned is deleted
exports.deleteTaskById = (req, res) => {
  const taskId = req.params.id;
  Task.findByIdAndDelete(taskId)
    .exec()
    .then(taskDoc => {
      if (!taskDoc) {
        res.status(404).json({
          message: `Cannot find the task with id ${taskId}`,
          data: []
        });
      } else {
        if (!taskDoc.completed && taskDoc.assignedUser) {
          User.findByIdAndUpdate(taskDoc.assignedUser, {
            $pull: { pendingTasks: taskDoc._id }
          })
            .exec()
            .then(userDoc => {
              res.status(200).json({
                message: "DELETE OK",
                data: taskDoc
              });
            })
            .catch(err => {
              res.status(500).json({
                message: `Failed to delete the pendingTasks of task with id ${taskId}`,
                data: []
              });
            });
        } else {
          res.status(200).json({
            message: "DELETE OK",
            data: taskDoc
          });
        }
      }
    })
    .catch(err => {
      res.status(500).json({
        message: `Failed to delete the task with id ${taskId}`,
        data: []
      });
    });
};
