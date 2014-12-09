/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc')
	.factory('todoStorage', function ($http) {
		'use strict';
		var store = {
			todos: [],
			seqNum: 0,
			clearCompleted: function () {
				var originalTodos = store.todos.slice(0);

				var completeTodos = [], incompleteTodos = [];
				store.todos.forEach(function (todo) {
					if (todo.completed) {
						completeTodos.push(todo);
					} else {
						incompleteTodos.push(todo);
					}
				});

				angular.copy(incompleteTodos, store.todos);

				return $http.delete('/item/-1')
					.error(function(data,status) {
						if(status === 500 && data.status === 0){
							return store.todos;
						}
						else if(status === 500){
							angular.copy(originalTodos, store.todos);
							return store.todos;
						}
						return store.todos;
					});
			},

			delete: function (todo) {
				var originalTodos = store.todos.slice(0);

				store.todos.splice(store.todos.indexOf(todo), 1);
				return $http.delete('/item/'+ todo.id)
					.error(function(data,status) {
						if(status === 500 && data.status === 0){
							return store.todos;
						}
						else if(status === 500){
							angular.copy(originalTodos, store.todos);
							return store.todos;
						}
						return store.todos;
					});
			},

			get: function () {
				return $http.get('/item')
					.success(function (data,status) {
						angular.copy(data, store.todos);
						return store.todos;
					});
			},

			insert: function (todo) {
				
				var originalTodos = store.todos.slice(0);

				return $http.post('/item', { id: todo.id, value: todo.title })
					.error(function(data,status) {
						if(status === 500 && data.status === 0){
							store.todos.push(todo);
						}
						else if(status === 500){
							angular.copy(originalTodos, store.todos);
						}
						
						
						
						return store.todos;
					});
			},

			put: function (todo) {
				var originalTodos = store.todos.slice(0);
				
				return $http.put('/item' ,{id: todo.id, value: todo.title, status: todo.completed?1:0})
					.error(function(data,status) {
						if(status === 500 && data.status === 0){
							return store.todos;
						}
						else if(status === 500){
							angular.copy(originalTodos, store.todos);
							return store.todos;
						}
						
					
					});
			}
		};

		return store;
	})

	