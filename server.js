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
    var queryParams = req.query;
    var filteredTodos = todos;

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, { completed: true});
    } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, { completed: false});
    }

   resp.json(filteredTodos);
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
        return resp.status(404).send('Nothing to delete!');
    }
});

app.put('/todos/:id', function (req, resp) {
    var body = _.pick(req.body, 'completed', 'description');
    var validAttributes = {};
    var id = parseInt(req.params.id);
    var matchedTodo = _.findWhere(todos, {id: id});

    if(!matchedTodo) {
        return resp.status(404).send('Nothing to update!');
    }

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttributes.completed = body.completed;
    } else if(body.hasOwnProperty('completed')) {
        return resp.status(400).send();
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        body.description = body.description.trim();
        validAttributes.description = body.description;
    } else if(body.hasOwnProperty('description')) {
        return resp.status(400).send();
    }

    _.extend(matchedTodo, validAttributes);
    resp.json(matchedTodo);
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
