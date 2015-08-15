var express = require('express');
var router = express.Router();
var config = require('../config');
var http = require('http');
var logger = require('winston');
var stringf = require('util').format;

router.get('/', function(req, res){
	res.send('Welcome to WebPad.  Append a path to the current URL and press CTRL+S to save this doc at that address.');
});
router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.log('debug', req.params[0]);
	var isDir = false;
	var selector = {};
	if(req.params[0].match(/\/$/)){
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
	// in case dir and doc exist, link to doc
	logger.log('info', list);
	var link_base = config.public_root+'/doc';
	var dirList = [];

	for(var i in list){
		var dirPath = list[i].split(/\//);
		logger.log('debug', dirPath);
		var rootDir = dirPath.shift();
		if(dirList[rootDir]===undefined){
			dirList[rootDir] = {
				title: rootDir,
				link: stringf('%s/%s/',link_base, rootDir),
				items: []
			};
		}
		var root = dirList[rootDir];
		var path = rootDir;
		outer:
		for(var d=0;d<dirPath.length;++d){
			logger.log('debug', 'root: %s, path: %s, dirPath: %s', root.link, path, dirPath[d]);
			path += '/'+dirPath[d];
			for(var j in root.items){
				if(root.items[j].title===dirPath[d]){
					root = root.items[j];
					logger.log('debug', 'dir exists; continue at %s', root.link);
					continue outer;
				}
			}
			var dir = {
				title: dirPath[d],
				link: stringf('%s/%s',link_base, path),
				items: []
			};
			if(!list[i].match(new RegExp(dirPath[d]+'$'))){
				dir.link += '/';
				logger.log('debug', 'list: %s, dirPath: %s, link: %s', list[i], dirPath[d], dir.link);
			}
			root.items.push(dir);
			logger.log('debug', 'root.items: ', require('util').inspect(root.items, { depth: null }));
			root = dir;
		}
	}
	var i=0;
	for(var r in dirList){
		dirList[i++] = dirList[r];
		delete dirList[r];
	}
	logger.log('info', require('util').inspect(dirList, { depth: null }));
	return dirList;
}
