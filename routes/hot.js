var express = require('express');
var router = express.Router();

router.get('/', function(req, res){
	var context = {
		host: req.protocol+'://'+req.host+(req.port===undefined?'':':'+req.port),
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'HotTableController',
		initElem: '#hotTable'
	};
	res.render('hot', context);
});
router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	var context = {
		host: req.protocol+'://'+req.host+(req.port===undefined?'':':'+req.port),
		page_title: 'WebPad',
		header_title: 'WebPad',
		controller: 'HotTableController',
		initElem: '#hotTable'
	};
	var path = req.params[0];
	if(path.match(/\/$/)){
		context.controller = 'DirTreeController';
		context.initElem = '#directoryTree'
		context.isDir = true;
		res.render('index', context);
	}
	else{
		res.render('hot', context);
	}
});

module.exports = router;