var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',
    'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250]
        }
    },
   completed: {
       type: Sequelize.BOOLEAN,
       allowNull: false,
       defaultValue: false
   }
});

var User = sequelize.define('user', {
   email: {
       type: Sequelize.STRING
   }
});

Todo.belongsTo(User);
User.hasMany(Todo);

sequelize.sync({
    //force: true
}).then(function () {
    User.findById(1).then(function(user) {
        user.getTodos({
            where: {
                completed: false
            }
        }).then(function(todos) {
            todos.forEach(function(todo) {
                console.log(todo.toJSON());
            })
        })
    });
    //User.create({
    //   email: 'test@example.com'
    //}).then(function() {
    //    return Todo.create({
    //        description: "Clean yard",
    //        completed: false
    //    })
    //}).then(function(todo) {
    //    User.findById(1).then(function(user) {
    //        user.addTodo(todo);
    //    })
    //});


    //Todo.create({
    //    description: 'Wake up',
    //    completed: true
    //}).then(function(todo) {
    //    return Todo.create({
    //        description: 'Take out the trash'
    //    })
    //}).then(function () {
    //    //return Todo.findById(1);
    //    return Todo.findAll({
    //        where: {
    //            completed: false,
    //            description: {
    //                $like: '%Wake%'
    //            }
    //        }
    //    })
    //}).then(function(todos) {
    //    //if(todo) {
    //    //    console.log(todo.toJSON());
    //    //} else {
    //    //    console.log('No todo found');
    //    //}
    //        if(todos) {
    //            todos.forEach(function (todo) {
    //                console.log(todo.toJSON());
    //            });
    //        } else {
    //            console.log('No todo found');
    //        }
    //})
    //.catch(function(e) {
    //    console.log(e);
    //});
});
