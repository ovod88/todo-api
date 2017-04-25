var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var db = require('./db');
var bcrypt = require('bcrypt');


var PORT = process.env.PORT || 3000;
//var todos = [{
//        id:1,
//        description: 'Take kids from school',
//        completed: false
//    },{
//        id:2,
//        description: 'Go to doctor',
//        completed: false
//    },
//    {
//        id:4,
//        description: 'Kiss me',
//        completed: true
//    }];
var todos = [], todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function(req, resp) {
   resp.send('To do API root');
});

app.get('/todos', function (req, resp) {
    var queryParams = req.query;
    var where = {};

    if(queryParams.hasOwnProperty('completed') && (queryParams.completed === 'true' || queryParams.completed === 'false')) {
        where.completed = (queryParams.completed === 'true');
    } else if(queryParams.hasOwnProperty('completed')) {
        return resp.status(400).send();
    }
    if(queryParams.hasOwnProperty('q')) {
        where.description = { $like: '%' + queryParams.q + '%'};
    }

    db.todo.findAll({
        where: where
    }).then(function(todos) {
        if(todos.length !== 0) {
            resp.json(todos);
        } else {
            resp.status(404).send();
        }
    }, function(e) {
        resp.status(500).json(e);
    });


   // var filteredTodos = todos;
   //
   // if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
   //     filteredTodos = _.where(filteredTodos, { completed: true});
   // } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
   //     filteredTodos = _.where(filteredTodos, { completed: false});
   // }
   //
   // if(queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
   //     filteredTodos = _.filter(filteredTodos, function(todo) {
   //         return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
   //     })
   // }
   //
   //resp.json(filteredTodos);
});

app.get('/todos/:id', function (req, resp) {
    var id = parseInt(req.params.id);

    db.todo.findById(id).then(
          function(todo) {
              if(!!todo) {
                  resp.json(todo);
              } else {
                  resp.status(404).send();
              }
          },
          function() {
                resp.status(500).send();
          }
    );
    //var matchedTodo;
    //var matchedTodo = _.findWhere(todos, {id: id});

    //todos.forEach(function(todo){
    //    if(todo.id === id) {
    //        matchedTodo = todo;
    //    }
    //});

    //if(matchedTodo) {
    //    resp.json(matchedTodo);
    //} else {
    //    resp.status(404).send('No entry with such id!');
    //}
});

app.delete('/todos/:id', function(req, resp){
    var id = parseInt(req.params.id);

    db.todo.destroy({
        where: {
            id: id
        }
    }).then(
      function(rows) {
          if(rows > 0) {
              resp.status(204).send('Deleted successfully');
          } else {
              resp.status(404).json({
                  error: 'Nothing to delete...'
              });
          }
      },  function(e) {
            resp.status(500).json(e);
      }
    ).catch(
        function(e) {
            resp.status(500).json(e);
        }
    );
    //var matchedTodo = _.findWhere(todos, {id: id});
    //
    //if(matchedTodo) {
    //    todos = _.without(todos, matchedTodo);
    //    resp.json(matchedTodo);
    //} else {
    //    return resp.status(404).send('Nothing to delete!');
    //}
});

app.put('/todos/:id', function (req, resp) {
    var body = _.pick(req.body, 'completed', 'description');
    var attributes = {};
    var id = parseInt(req.params.id);

    if(body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }

    if(body.hasOwnProperty('description') && typeof body.description === 'string') {
        body.description = body.description.trim();
        attributes.description = body.description;
    }

    db.todo.findById(id).then(
        function(todo) {
            if(todo) {
                todo.update(attributes).then(function(todo) {
                    resp.json(todo);
                }, function(e) {
                    resp.status(400).json(e);
                });
            } else {
                resp.status(404).send();
            }
        }, function() {
            resp.status(500).send();
        }
    ).catch(function(e) {
        resp.status(500).json(e);
    });
});

app.post('/todos', function (req, resp) {
    var body = _.pick(req.body, 'completed', 'description');
    if(typeof body.description === 'string') {
        body.description = body.description.trim();
    }


    db.todo.create(body).then(
        function(todo) {
            resp.json(todo.toJSON());
        },function(e) {
            resp.status(400).json(e);
        }
    );
    //
    //
    //if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.length === 0) {
    //    return resp.status(400).send();
    //}
    //
    //body.id = todoNextId++;
    //todos.push(body);
    //
    //resp.json(body)
});

app.post('/users', function (req, resp) {
    var body = _.pick(req.body, 'email', 'password');
    if(typeof body.email === 'string') {
        body.email = body.email.trim();
    }

    if(typeof body.password === 'string') {
        body.password = body.password.trim();
    }

    db.user.create(body).then(
        function(user) {
            resp.json(user.toPublicJSON());
        },function(e) {
            resp.status(400).json(e);
        }
    );
});

app.post('/users/login', function(req, resp) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.authenticate(body).then(function(user) {
        resp.json(user.toPublicJSON());
    }, function() {
        resp.status(401).send();
    });
});

db.sequelize.sync().then(function () {
    app.listen(PORT, function() {
        console.log('Server launched on port ' + PORT + '!');
    });
});
