'use strict';
var webpadApp = angular.module('webpadApp', ['uiController', 'uiServices', 'ui.tree']);

var uiController = angular.module('uiController', []);
var uiServices = angular.module('uiServices', []);

uiController.controller('WebPadController', function($scope, DocumentService){
	var path = window.location.pathname.replace(/^\/doc\//, '/txt/');
	DocumentService.read(path).then(function(data){
		$scope.wpDoc = data;
		$scope.$apply();
	}, function(e){
		console.log('error: %s', e);
	});

	$scope.onKeyDown = function(e){
		if(e.ctrlKey){
			switch(e.which){
			case 79:	//o
				break;
			case 83:	//s
				var postDoc = {
					doc:$scope.wpDoc
				};
				DocumentService.update(path, postDoc).then(function(){
					// message
					console.log('Document saved');
				}, function(e){
					// message
					console.log('Error: %s', e);
				});
				e.preventDefault();
				return false;
			case 192:	//~
			default:
				console.log(e.which+' pressed');
			}
		}
	};
});

uiController.controller('DirTreeController', function($scope, DocumentService){
	var path = window.location.pathname.replace(/^\/\w+\//, '/txt/');
	DocumentService.read(path).then(function(data){
		$scope.dirList = data;
		$scope.$apply();
	}, function(e){
		console.log('error: %s', e);
	});

	$scope.expandRow = function(elm){
		elm.toggle();
	};
	$scope.deleteRow = function(doc){
		var url = doc.replace(/\/doc\//, '/txt/');
		console.log(url);
		DocumentService.delete(url).then(function(data){
			console.log('deleted');
			window.location.reload();
		}, function(e){
			console.log('error: %s',e);
		});
	};
	// angular-ui-tree options
	$scope.options = {
	};
});

uiController.controller('AceEditorController', function(DocumentService){
	var editor = ace.edit('aceEditor');
	editor.setTheme('ace/theme/gob');
	editor.setKeyboardHandler('ace/keyboard/vim');
	editor.getSession().setUseWrapMode(true);

	var path = window.location.pathname.replace(/^\/vim\//, '/txt/');
	DocumentService.read(path).then(function(data){
		editor.setValue(data);
	}, function(e){
		console.error(e);
	});

	function vimNotify(cm, text){
		cm.openNotification('<span style="color: red">' + text + '</span>', {bottom: true, duration: 4999});
	}
	ace.config.loadModule('ace/keyboard/vim', function(module){
		var vim = module.CodeMirror.Vim;
		vim.defineEx('write', 'w', function(cm, input){
			var newPath = path;
			if(input.args){
				newPath = '/txt/'+input.args;
			}
			var postDoc = {
				doc: editor.getValue()
			};
			DocumentService.update(newPath, postDoc).then(function(){
				vimNotify(cm, 'saved');
			}, function(e){
				vimNotify(cm, 'Error: '+e);
			});
		});
		vim.defineEx('open', 'o', function(cm, input){
			var newPath = input.args;
			window.history.replaceState({}, '', '/vim/'+newPath);
			DocumentService.read('/txt/'+newPath).then(function(data){
				editor.setValue(data);
			vimNotify(cm, 'loaded');
			}, function(e){
				vimNotify(cm, e);
			});
		});
		vim.defineEx('edit', 'e', function(cm, input){
			window.open(input.args, '_newtab');
		});
	});
});

uiServices.service('DocumentService', function($http){
	this.create = function(){

	};
	this.read = function(path){
		return new Promise(function(resolve, reject){
			$http.get(path)
			.success(function(data){
				resolve(data);
			})
			.error(function(e){
				reject(e);
			});
		});
	};
	this.update = function(path, doc){
		return new Promise(function(resolve, reject){
			$http.post(path, doc)
			.success(function(data){
				resolve(data);
			})
			.error(function(e){
				reject(e);
			});
		});
	};
	this.delete = function(path){
		return new Promise(function(resolve, reject){
			$http.delete(path)
			.success(function(data){
				resolve(data);
			})
			.error(function(e){
				reject(e);
			});
		});
	};
});
