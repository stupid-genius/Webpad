'use strict';
var webpadApp = angular.module('webpadApp', ['uiController', 'ui.tree']);

var uiController = angular.module('uiController', []);

uiController.controller('WebPadController', function($scope, $http){
	var path = window.location.pathname.replace(/^\/doc\//, '/txt/');
	$http.get(path)
	.success(function(data){
		$scope.wpDoc = data;
	})
	.error(function(e){
		console.log('error: %s', e);
	});

	$scope.onKeyDown = function(e){
		if(e.altKey){
			switch(e.which){
			case 79:	//o
				break;
			case 83:	//s
				var postDoc = {
					doc:$scope.wpDoc
				};
				$http.post(path, postDoc)
				.success(function(){
					// message
					console.log('Document saved');
				})
				.error(function(e){
					// message
					console.log('Error: %s', e);
				});
				break;
			case 192:	//~
			default:
				console.log(e.which+' pressed');
			}
		}
	};
});

uiController.controller('DirTreeController', function($scope, $http){
	var path = window.location.pathname.replace(/^\/doc\//, '/txt/');
	$http.get(path)
	.success(function(data){
		$scope.dirList = data;
	})
	.error(function(e){
		console.log('error: %s', e);
	});

	$scope.expandRow = function(scope){
		scope.toggle();
	};
	$scope.deleteRow = function(obj){
		console.log(obj);
	};
	$scope.options = {
	};
});
