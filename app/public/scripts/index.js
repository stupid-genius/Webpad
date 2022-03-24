'use strict';
/* global ace angular Handsontable */
/* eslint-disable-next-line no-unused-vars */
const webpadApp = angular.module('webpadApp', ['uiController', 'uiServices', 'ui.tree', 'ui.tinymce']);

const uiController = angular.module('uiController', []);
const uiServices = angular.module('uiServices', []);

uiController.controller('WebPadController', ['$scope', '$rootScope', 'DocumentService', function($scope, $rootScope, DocumentService){
	const path = window.location.pathname.replace(/^\/edit\//, '/txt/');
	DocumentService.read(path).then(function(data){
		$rootScope.page_title = path.replace(/\/(?:[^/]+\/)*/, '');
		$scope.wpDoc = data;
		$scope.$apply();
	}, function(e){
		console.error('error: %s', e);
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
					console.error('Error: %s', e);
				});
				e.preventDefault();
				return false;
			case 192:	//~
			default:
				console.log(e.which+' pressed');
			}
		}
	};
}]);

uiController.controller('DirTreeController', ['$scope', 'DocumentService', function($scope, DocumentService){
	const path = window.location.pathname.replace(/^\/\w+\//, '/txt/');
	DocumentService.read(path).then(function(data){
		$scope.dirList = data;
		$scope.$apply();
	}, function(e){
		console.error('error: %s', e);
	});

	$scope.expandRow = function(elm){
		elm.toggle();
	};
	$scope.deleteRow = function(doc){
		const url = doc.replace(/^\.\./, '/txt');
		DocumentService.delete(url).then(function(data){
			console.log('deleted');
			window.location.reload();
		}, function(e){
			console.error('error: %s',e);
		});
	};
	// angular-ui-tree options
	$scope.options = {
	};
}]);

uiController.controller('AceEditorController', ['$rootScope', 'DocumentService', function($rootScope, DocumentService){
	const editor = ace.edit('aceEditor');
	editor.setTheme('ace/theme/gob');
	editor.setKeyboardHandler('ace/keyboard/vim');
	editor.getSession().setUseWrapMode(true);

	const path = window.location.pathname.replace(/^\/vim\//, '/txt/');
	DocumentService.read(path).then(function(data){
		editor.setValue(data);
		$rootScope.page_title = path.replace(/\/(?:[^/]+\/)*/, '');
		$rootScope.$apply();
	}, function(e){
		console.error(e);
	});

	function vimNotify(cm, text){
		cm.openNotification('<span style="color: red">' + text + '</span>', {bottom: true, duration: 4999});
	}
	ace.config.loadModule('ace/keyboard/vim', function(module){
		const vim = module.CodeMirror.Vim;
		vim.defineEx('write', 'w', function(cm, input){
			let newPath = path;
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
			const newPath = input.args;
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
}]);

uiController.controller('TinyMCEController', ['$scope', '$rootScope', 'DocumentService', function($scope, $rootScope, DocumentService){
	let tinymceEditor;
	$scope.tinymceConfig = {
		skin: 'lightgray',
		theme : 'modern',
		init_instance_callback: function(editor){
			tinymceEditor = editor;
			const editorHeight = document.getElementById('main').offsetHeight - 130;
			editor.theme.resizeTo(undefined, editorHeight);
			// editor.execCommand('mceFullScreen');

			const path = window.location.pathname.replace(/^\/doc\//, '/txt/');
			$rootScope.page_title = path.replace(/\/(?:[^/]+\/)*/, '');
			$rootScope.$apply();
			DocumentService.read(path).then(function(doc){
				if(doc!==undefined){
					editor.setContent(doc);
				}
			}).catch((e) => {
				console.error('error');
				console.dir(e);
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
			const path = window.location.pathname.replace(/^\/doc\//, '/txt/');
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
}]);

uiController.controller('HotTableController', ['$scope', '$rootScope', 'HotDataSourceFactory', function($scope, $rootScope, HotDataSourceFactory){
	const path = window.location.pathname.replace(/^\/hot\//, '/txt/');
	const table = document.getElementById('hotTable');
	const hotTable = new Handsontable(table, {
		stretchH: 'all',
		width: '100%',
		rowHeaders: true,
		colHeaders: true,
		columnSorting: true,
		sortIndicator: true
	});
	const dataSource = HotDataSourceFactory.get(hotTable, path);
	dataSource.read();
	hotTable.addHook('afterChange', function(){
		dataSource.save();
	});
	$rootScope.page_title = path.replace(/\/(?:[^/]+\/)*/, '');
	// $scope.$apply();
}]);
uiController.factory('HotDataSourceFactory', ['DocumentService', function(docService){
	this.get = function(hotTable, path){
		let dataStore = [];
		const dataSource = {};
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
					const csvDataStore = dataStore.map(function(row){
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

uiServices.service('DocumentService', ['$http', function($http){
	this.create = function(path, doc){
		const postDoc = {
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
		const postDoc = {
			doc: doc
		};
		return new Promise(function(resolve, reject){
			$http.put(path, postDoc)
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
}]);

