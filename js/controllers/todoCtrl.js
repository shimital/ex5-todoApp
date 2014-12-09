/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */
angular.module('todomvc')
	.controller('TodoCtrl', function TodoCtrl($scope,$rootScope, $routeParams,$location, $filter, todoStorage) {
		'use strict';
		var todos = $scope.todos = todoStorage.todos;
		$scope.newTodo = '';
		$scope.editedTodo = null;
		$scope.$watch('todos', function () {
			$scope.remainingCount = $filter('filter')(todos, { completed: false }).length;
			$scope.completedCount = todos.length - $scope.remainingCount;
			$scope.allChecked = !$scope.remainingCount;
		}, true);

		// Monitor the current route for changes and adjust the filter accordingly.
		$scope.$on('$routeChangeSuccess', function () {
			var status = $scope.status = $routeParams.status || '';

			$scope.statusFilter = (status === 'active') ?
				{ completed: false } : (status === 'completed') ?
				{ completed: true } : null;
		});
		
		$scope.addTodo = function () {
			var newTodo = {
				id: todoStorage.seqNum,
				title: $scope.newTodo.trim(),
				completed: false
			};
			todoStorage.seqNum++;
			
			if (!newTodo.title) {
				return;
			}
			$scope.saving = true;
			todoStorage.insert(newTodo)
				.then(function success() {

				}, function error(reason) {
				    if (reason.status === 500) {
				        $scope.newTodo = '';
				    }
				    else {
				        $rootScope.serverResponse = "Session expired, please login"
				        $location.path("/login"); 
				    }
				})
                .finally(function () {
                    $scope.saving = false;
                });
		};

		$scope.editTodo = function (todo) {
			$scope.editedTodo = todo;
			// Clone the original todo to restore it on demand.
			$scope.originalTodo = angular.extend({}, todo);
		};

		$scope.saveEdits = function (todo, event) {
			// Blur events are automatically triggered after the form submit event.
			// This does some unfortunate logic handling to prevent saving twice.
			if (event === 'blur' && $scope.saveEvent === 'submit') {
				$scope.saveEvent = null;
				return;
			}

			$scope.saveEvent = event;

			if ($scope.reverted) {
				// Todo edits were reverted-- don't save.
				$scope.reverted = null;
				return;
			}

			todo.title = todo.title.trim();

			if (todo.title === $scope.originalTodo.title) {
				return;
			}

			todoStorage[todo.title ? 'put' : 'delete'](todo)
				.then(function success() {}, function error() {
					
				})
				.finally(function () {
					$scope.editedTodo = null;
				});
		};

		$scope.revertEdits = function (todo) {
			todos[todos.indexOf(todo)] = $scope.originalTodo;
			$scope.editedTodo = null;
			$scope.originalTodo = null;
			$scope.reverted = true;
		};

		$scope.removeTodo = function (todo) {
			todoStorage.delete(todo);
		};

		$scope.saveTodo = function (todo) {
			todoStorage.put(todo);
		};

		$scope.toggleCompleted = function (todo, completed) {
			if (angular.isDefined(completed)) {
				todo.completed = completed;
			}
			todoStorage.put(todo, todos.indexOf(todo))
				.then(function success() {}, function error() {
					
				});
		};

		$scope.clearCompletedTodos = function () {
			todoStorage.clearCompleted();
		};

		$scope.markAll = function (completed) {
			todos.forEach(function (todo) {
				if (todo.completed !== completed) {
					$scope.toggleCompleted(todo, completed);
				}
			});
		};
	});
	
	