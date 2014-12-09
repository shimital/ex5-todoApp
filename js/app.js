/*global angular */

/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
angular.module('todomvc', ['ngRoute'])
	.config(function ($routeProvider, $locationProvider) {
		
		'use strict';
		$routeProvider
			.when('/', {controller:'JoinCtrl',
						templateUrl: '/partials/join.html'})
			.when('/todos', {controller:'TodoCtrl',
							templateUrl: '/partials/todomvc-index.html',
							resolve: {
								fetch: function(todoStorage){
									return todoStorage.get();
								}
							
							}})
			.when('/todos/:status', {controller:'TodoCtrl'
									,templateUrl: '/partials/todomvc-index.html'})
			.otherwise({
				redirectTo: '/'
			});
		
	});
	
	
	 
	
	