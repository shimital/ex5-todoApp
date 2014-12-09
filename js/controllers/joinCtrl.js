
angular.module('todomvc')
	.controller('JoinCtrl',function JoinCtrl($scope,$rootScope,$http,$location){
		
		$scope.resType = 'success';
		$scope.logData = {
			username: "",
			password: ""
		};
		
		$scope.registerData = {
			fullName: "",
			username: "",
			password: "",
			passwordVerification: ""
		};
		
		$scope.logSubmit = function(){
			$http.post('/login', $scope.logData).
				success(function(data){	
				    $rootScope.serverResponse = data;
					$location.path("/todos");
					
				}).
				error(function(data){
				    $rootScope.serverResponse = data;
				});
		};
		
		$scope.registerSubmit = function(){
			$http.post('/register', $scope.registerData).
				success(function (data) {
				    $scope.registerData.fullName = "";
				    $scope.registerData.username = "";
				    $scope.registerData.password = "";
				    $scope.registerData.passwordVerification = "";
				    $rootScope.serverResponse = data;

				}).
				error(function(data){
				    $rootScope.serverResponse = data.error;
				});
		};
	});