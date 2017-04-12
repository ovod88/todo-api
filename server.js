var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
        id:1,
        description: 'Take kids from school',
        completed: false
    },{
        id:2,
        description: 'Go to doctor',
        completed: false
    },
    {
        id:4,
        description: 'Kiss me',
        completed: true
    }];

app.get('/', function(req, resp) {
   resp.send('To do API root');
});

app.get('/todos', function (req, resp) {
   resp.json(todos);
});

app.get('/todos/:id', function (req, resp) {
    var id = parseInt(req.params.id),
        matchedTodo;

    todos.forEach(function(todo){
        if(todo.id === id) {
            matchedTodo = todo;
        }
    });

    if(matchedTodo) {
        resp.json(matchedTodo);
    } else {
        resp.status(404).send('No entry with such id!');
    }
});

app.listen(PORT, function() {
    console.log('Server launched on port ' + PORT + '!');
});