var express = require('express');
var router = express.Router();
var config = require('../config');
var logger = require('winston');

router.get('/', function(req, res){
	var context = {
		host: req.protocol+'://'+req.host+(req.port===undefined?'':':'+req.port),
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'AceEditorController',
		initElem: '#aceEditor',
	};
	res.render('ace', context);
});
router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	var context = {
		host: req.protocol+'://'+req.host+(req.port===undefined?'':':'+req.port),
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'AceEditorController',
		initElem: '#aceEditor',
	};
	var path = req.params[0];
	if(path.match(/\/$/)){
		context.controller = 'DirTreeController';
		context.initElem = '#directoryTree'
		context.isDir = true;
		res.render('index', context);
	}
	else{
		res.render('ace', context);
	}
});

module.exports = router;
