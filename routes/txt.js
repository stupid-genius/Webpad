var express = require('express');
var router = express.Router();
var config = require('../config');
var http = require('http');
var logger = require('winston');

router.get('/', function(req, res){
	res.send('Welcome to WebPad.  Append a path to the current URL and press ALT+S to save this doc at that address.');
});
router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.log('debug', req.params[0]);
	var isDir = false;
	var selector = {};
	if(req.params[0].match(/\/$/)){
		//selector.name = new RegExp(req.params[0].replace(/\/$/, '/.+'));
		selector.name = {
			$regex: req.params[0].replace(/\/$/, '/.+')
		};
		isDir = true;
	}
	else{
		selector.name = req.params[0];
	}

	var results = '';
	var request = http.request({
		hostname: config.crud_host,
		port: config.crud_port,
		auth: config.crud_user+':'+config.crud_pw,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		path: config.crud_r
	}, function(response){
		logger.log('debug', selector.name);
		logger.log('debug', response.statusCode);
		response.on('data', function(chunk){
			results += chunk;
		});
		response.on('end', function(){
			logger.log('debug', results);
			results = JSON.parse(results);
			if(isDir){
				var list = [];
				for(var r in results){
					list.push(results[r].name);
				}
				res.send(JSON.stringify(buildDirTree(list)));
			}
			else{
				if(results.length>0){
					res.send(results[0].content);
				}
				else{
					res.end();
				}
			}
		});
	});
	request.on('error', function(e){
		logger.log('error', e);
	});
	logger.log('debug', JSON.stringify(selector));
	request.write(JSON.stringify(selector));
	request.end();
});
router.post(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.log('debug', req.params[0]);
	var payload = [
		{name: req.params[0]},
		{
			name: req.params[0],
			content: req.body.doc
		},
		{upsert: true}
	];
	var mesg = '';
	var request = http.request({
		hostname: config.crud_host,
		port: config.crud_port,
		auth: config.crud_user+':'+config.crud_pw,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		path: config.crud_u
	}, function(response){
		logger.log('debug', response.statusCode);
		response.on('data', function(chunk){
			mesg += chunk;
		});
		response.on('end', function(){
			logger.log('debug', mesg);
			res.send(mesg);
		});
	});
	request.on('error', function(e){
		logger.log('error', e);
	});
	logger.log('debug', JSON.stringify(payload));
	request.write(JSON.stringify(payload));
	request.end();
});
router.delete(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.log('debug', req.params[0]);
	var selector = {
		name: req.params[0]
	};
	var mesg = '';
	var request = http.request({
		hostname: config.crud_host,
		port: config.crud_port,
		auth: config.crud_user+':'+config.crud_pw,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		path: config.crud_d
	}, function(response){
		logger.log('debug', response.statusCode);
		response.on('data', function(chunk){
			mesg += chunk;
		});
		response.on('end', function(){
			logger.log('debug', mesg);
			res.send(mesg);
		});
	});
	request.on('error', function(e){
		logger.log('error', e);
	});
	request.write(JSON.stringify(selector));
	request.end();
});

module.exports = router;

function buildDirTree(list){
	var dirList = [];
	function FSObject(id, title, link)
	{
		this.id = id;
		this.title = title;
		this.link = link;
		this.items = [];
	}
	var count = 1;

	for(var i in list)
	{
		var dirPath = list[i].split(/\//);
		var rootDir = dirPath.shift();
		if(dirList.length===0)
			dirList.push(new FSObject(1, rootDir, ''));
		var root = dirList[0];
		var base = '';
		outer:
		for(var d in dirPath)
		{
			for(var j in root.items)
			{
				if(root.items[j].title==dirPath[d])
				{
					root = root.items[j];
					continue outer;
				}
			}
			base += dirPath[d];
			if(!list[i].match(new RegExp(dirPath[d]+'$')))
				base += '/';
			var dir = new FSObject(count++, dirPath[d], base);
			root.items.push(dir);
			root = dir;
		}
	}
	return dirList;
}
