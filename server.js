var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
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
   resp.json(todos);
});

app.get('/todos/:id', function (req, resp) {
    var id = parseInt(req.params.id);
    //var matchedTodo;
    var matchedTodo = _.findWhere(todos, {id: id});

    //todos.forEach(function(todo){
    //    if(todo.id === id) {
    //        matchedTodo = todo;
    //    }
    //});

    if(matchedTodo) {
        resp.json(matchedTodo);
    } else {
        resp.status(404).send('No entry with such id!');
    }
});

app.delete('/todos/:id', function(req, resp){
    var id = parseInt(req.params.id);
    var matchedTodo = _.findWhere(todos, {id: id});

    if(matchedTodo) {
        todos = _.without(todos, matchedTodo);
        resp.json(matchedTodo);
    } else {
        resp.status(404).send('Nothing to delete!');
    }
});

app.post('/todos', function (req, resp) {
    var body = _.pick(req.body, 'completed', 'description');
    body.description = body.description.trim();

    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.length === 0) {
        return resp.status(400).send();
    }

    body.id = todoNextId++;
    todos.push(body);

    resp.json(body)
});

app.listen(PORT, function() {
    console.log('Server launched on port ' + PORT + '!');
});
