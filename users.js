//users

//Here we are holding all the users, the property will be username and it is unique.
var users = [];
var cookies = {};

module.exports = {
	get: function(username){
		return users[username];
	},
	getTodos: function(username){
		return users[username].todos;
	},
	insertUser:function(details){
		users[details.username] = {fullName: details.fullName, password: details.password, todos: []};
	},
	getUserByCookie: function(cookie){
		return cookies[cookie];
	},
	setUserByCookie: function(cookie,username){
		cookies[cookie] = username;
	},
	isIdExists: function(id,todos){
		for(var i = 0; i < todos.length; i++){
			if(todos[i].id === id){
				return i;
			}
		}
		return -1;
	},
	insertTodo: function(username,todoId,todoVal){
		if(this.isIdExists(todoId,users[username].todos) < 0){
			users[username].todos.push({id: todoId, completed: false, title: todoVal});
			return {status: 0, msg: ""};
		}
		return {status: 1, msg: "id of todo item already exists."};
	},
	deleteTodo: function(username,todoId){
		for(var todo in users[username].todos){
			if(users[username].todos[todo].id === todoId){
				users[username].todos.splice(todo,1);
				return {status: 0, msg: ""};
			}
		}
		return {status:1, msg: "item does not exist"};
	},
	deleteCompleted: function(username){
		var noCompleted = users[username].todos.filter(function(todo){
			return !todo.completed; 
		});
		users[username].todos = noCompleted;
		return {status: 0, msg: ""};
	},
	updateTodo: function(username, todoId, value, completed){
		var todoIndex = this.isIdExists(todoId,users[username].todos);
		if(todoIndex < 0){
			return {status: 1, msg: "item does not exist"};
		}
		users[username].todos[todoIndex].title = value;
		users[username].todos[todoIndex].completed = completed;
		return {status: 0, msg: ""};
	}
	
	
};