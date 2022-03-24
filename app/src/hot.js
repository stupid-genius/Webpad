const express = require('express');
const router = express.Router();

router.get('/', function(req, res){
	const context = {
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'HotTableController',
		initElem: 'hotTable',
		template: 'hot'
	};
	res.render('index', context);
});
router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	const context = {
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'HotTableController',
		initElem: 'hotTable',
		template: 'hot'
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
