var express = require('express');
var router = express.Router();
var config = require('../config');
var logger = require('winston');

router.get('/', function(req, res){
	var context = {
		host: config.public_root,
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'WebPadController'
	};
	res.render('doc', context);
});
router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.log('debug', req.params[0]);

	var context = {
		host: config.public_root,
		page_title: 'WebPad',
		header_title: 'WebPad'
	};

	var path = req.params[0];
	if(path.match(/\/$/)){
		context.controller = 'DirTreeController';
		context.initElem = '#directoryTree'
		context.isDir = true;
	}
	else{
		context.controller = 'WebPadController';
		context.initElem = '.fullscreen';
		context.isDir = false;
	}

	res.render('index', context);
});

module.exports = router;
