'use strict';
var webpadApp = angular.module('webpadApp', ['uiController', 'uiServices', 'ui.tree', 'ui.tinymce']);

var uiController = angular.module('uiController', []);
var uiServices = angular.module('uiServices', []);

uiController.controller('WebPadController', function($scope, $rootScope, DocumentService){
	var path = window.location.pathname.replace(/^\/edit\//, '/txt/');
	DocumentService.read(path).then(function(data){
		// $rootScope.doc_title = data.match(/^\s*(.+?)(?=[\r\x0a]{1,2})/)[0]+' - ';
		$rootScope.doc_title = path.replace(/^\/[^\/]+/, '') + ' - ';
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
				DocumentService.update(path, $scope.wpDoc).then(function(){
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
		var url = doc.replace(/\/(?:edit|vim|doc)\//, '/txt/');
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

uiController.controller('AceEditorController', function($rootScope, DocumentService){
	var editor = ace.edit('aceEditor');
	editor.setTheme('ace/theme/gob');
	editor.setKeyboardHandler('ace/keyboard/vim');
	editor.getSession().setUseWrapMode(true);

	var path = window.location.pathname.replace(/^\/vim\//, '/txt/');
	DocumentService.read(path).then(function(data){
		editor.setValue(data);
		// $rootScope.doc_title = data.match(/^\s*(.+?)(?=[\r\x0a]{1,2})/)[0]+' - ';
		$rootScope.doc_title = path.replace(/^\/[^\/]+/, '') + ' - ';
		$rootScope.$apply();
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
			DocumentService.update(newPath, editor.getValue()).then(function(){
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

uiController.controller('TinyMCEController', function($scope, $rootScope, DocumentService){
	var tinymceEditor;
	$scope.tinymceConfig = {
		skin: 'lightgray',
		theme : 'modern',
		init_instance_callback: function(editor){
			tinymceEditor = editor;
			editor.theme.resizeTo(undefined, $('#tinymceEditor').height()-108);
			// editor.execCommand('mceFullScreen');

			var path = window.location.pathname.replace(/^\/doc\//, '/txt/');
			DocumentService.read(path).then(function(doc){
				if(doc!==undefined){
					editor.setContent(doc);
					$rootScope.doc_title = path.replace(/^\/[^\/]+/, '') + ' - ';
					$rootScope.$apply();
				}
			});
		},
		setup: function(editor){
			editor.on('BeforeSetContent', function(contentEvent){
				// contentEvent.content = contentEvent.content.replace(/\r?\n/g, '<br />');
			});
		},
		plugins: [
			'advlist autolink lists link image charmap print preview hr anchor pagebreak',
			'searchreplace wordcount visualblocks visualchars code fullscreen',
			'insertdatetime media nonbreaking save table contextmenu directionality',
			'emoticons template paste textcolor colorpicker textpattern imagetools codesample toc'	//help
		],
		toolbar1: 'save | undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media | forecolor backcolor emoticons | codesample help',
		// toolbar2: '',
		entity_encoding: 'raw',
		save_enablewhendirty: false,
		save_onsavecallback: function(){
			var path = window.location.pathname.replace(/^\/doc\//, '/txt/');
			DocumentService.update(path, tinymceEditor.getContent()).then(function(){
				console.log('saved');
			}, function(msg){
				console.error(JSON.stringify(msg));
			});
		}
	};
	$scope.onsubmit = function(){
		console.log('submit form');
	};
});

uiController.controller('HotTableController', function($scope, $rootScope, HotDataSourceFactory){
	var path = window.location.pathname.replace(/^\/hot\//, '/txt/');
	var table = $('#hotTable')[0];
	var hotTable = new Handsontable(table, {
		stretchH: 'all',
		width: '100%',
		rowHeaders: true,
		colHeaders: true,
		columnSorting: true,
		sortIndicator: true
	});
	var dataSource = HotDataSourceFactory.get(hotTable, path);
	dataSource.read();
	hotTable.addHook('afterChange', function(){
		dataSource.save();
	});
	$rootScope.doc_title = path.replace(/^\/[^\/]+/, '') + ' - ';
	// $scope.$apply();
});
uiController.factory('HotDataSourceFactory', ['DocumentService', function(docService){
	this.get = function(hotTable, path){
		var dataStore = [];
		var dataSource = {};
		Object.defineProperties(dataSource, {
			data: {
				get: function(){
					return dataStore;
				}
			},
			read: {
				value: function(){
					docService.read(path).then(function(data){
						dataStore = data.split(/[\r\n]+/).map(function(row){
							return row.split(/,/);
						});
						hotTable.loadData(dataStore);
						hotTable.render();
					});
				}
			},
			save: {
				value: function(){
					var csvDataStore = dataStore.map(function(row){
						return row.join(',');
					}).join('\n');
					return docService.update(path, csvDataStore).then(function(){
						console.log('hot saved');
					});
				}
			},
			delete: {
				value: function(){
					return docService.delete(path).then(function(){
					});
				}
			}
		});
		return dataSource;
	};
	return this;
}]);

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
		var postDoc = {
			doc: doc
		};
		return new Promise(function(resolve, reject){
			$http.post(path, postDoc)
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
