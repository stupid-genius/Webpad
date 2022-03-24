const express = require('express');
const path = require('path');
const Logger = require('./logger');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));
const router = express.Router();

router.get('/', function(req, res){
	const context = {
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'TinyMCEController',
		initElem: 'tinymceEditor',
		template: 'tiny',
		// debug: true
	};
	res.render('index', context);
});
router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	const context = {
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'TinyMCEController',
		initElem: 'tinymceEditor',
		template: 'tiny',
		// debug: true
	};
	const path = req.params[0];
	if(path.match(/\/$/)){
		context.controller = 'DirTreeController';
		context.initElem = 'directoryTree';
		context.template = 'directory';
	}

	res.render('index', context);
});

module.exports = router;

