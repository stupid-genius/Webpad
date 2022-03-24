const express = require('express');
const http = require('http');
const path = require('path');
const config = require('./config');
const Logger = require('./logger');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));
const router = express.Router();

function buildDirTree(list, url){
	// in case dir and doc exist, link to doc
	logger.info(list);
	logger.debug(`url: ${url}`);
	const link_base = '..';
	const dirList = [];

	for(let i in list){
		const dirPath = list[i].split(/\//);
		logger.debug(dirPath);
		const rootDir = dirPath.shift();
		if(dirList[rootDir]===undefined){
			dirList[rootDir] = {
				title: rootDir,
				link: `${link_base}/${rootDir}/`,
				items: []
			};
		}
		let root = dirList[rootDir];
		let path = rootDir;
		outer:
		for(let d=0;d<dirPath.length;++d){
			logger.debug('root: %s, path: %s, dirPath: %s', root.link, path, dirPath[d]);
			path += `/${dirPath[d]}`;
			for(const j in root.items){
				if(root.items[j].title===dirPath[d]){
					root = root.items[j];
					logger.debug('dir exists; continue at %s', root.link);
					continue outer;
				}
			}
			const dir = {
				title: dirPath[d],
				link: `${link_base}/${path}`,
				items: []
			};
			if(!list[i].match(new RegExp(dirPath[d]+'$'))){
				dir.link += '/';
				logger.debug('list: %s, dirPath: %s, link: %s', list[i], dirPath[d], dir.link);
			}
			root.items.push(dir);
			logger.debug('root.items: ', require('util').inspect(root.items, { depth: null }));
			root = dir;
		}
	}
	/*
	const tempDirList = list.reduce((acc, cur) => {
		const dirPath = cur.split(/\//);
		logger.debug(dirPath);
		const rootDir = dirPath.shift();
		if(acc[rootDir]===undefined){
			acc[rootDir] = {
				title: rootDir,
				link: `${link_base}/${rootDir}/`,
				items: []
			};
		}
	}, {});
	*/
	let i=0;
	for(const r in dirList){
		dirList[i++] = dirList[r];
		delete dirList[r];
	}
	logger.info(require('util').inspect(dirList, { depth: null }));
	return dirList;
}

router.get('/', function(req, res){
	res.send('Welcome to WebPad.  Append a path to the current URL and press CTRL+S to save this doc at that address.');
});

router.get(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.debug(req.params[0]);
	let isDir = false;
	let selector;
	if(req.params[0].match(/\/$/)){
		selector = encodeURIComponent(`name[$regex]=${req.params[0].replace(/\/$/, '/.+')}`);
		isDir = true;
	}
	else{
		selector = `name=${req.params[0]}`;
	}
	logger.debug(selector);

	let results = '';
	const request = http.request({
		hostname: config.crud_host,
		port: config.crud_port,
		auth: `${config.crud_user}:${config.crud_pw}`,
		method: 'GET',
		path: `/webpad/documents?${selector}`
	}, function(response){
		logger.debug(selector);
		logger.debug(response.statusCode);
		response.on('data', function(chunk){
			results += chunk;
		});
		response.on('end', function(){
			logger.debug(results);
			results = JSON.parse(results);
			if(isDir){
				const list = results.map((e) => {
					return e.name;
				});
				res.set('Content-Type', 'application/json');
				res.send(JSON.stringify(buildDirTree(list, req.originalUrl)));
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
		logger.error(e);
	});
	request.end();
});

router.post(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.debug(req.params[0]);
	const payload = {
		name: req.params[0],
		content: req.body.doc
	};
	let mesg = '';
	const request = http.request({
		hostname: config.crud_host,
		port: config.crud_port,
		auth: `${config.crud_user}:${config.crud_pw}`,
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		path: '/webpad/documents'
	}, function(response){
		logger.debug(response.statusCode);
		response.on('data', function(chunk){
			mesg += chunk;
		});
		response.on('end', function(){
			logger.debug(mesg);
			res.send(mesg);
		});
	});
	request.on('error', function(e){
		logger.error(e);
	});
	logger.debug(JSON.stringify(payload));
	request.write(JSON.stringify(payload));
	request.end();
});

router.put(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.debug(req.params[0]);
	const payload = {
		selector: {
			name: req.params[0]
		},
		doc: {
			name: req.params[0],
			content: req.body.doc
		}
	};
	let mesg = '';
	const request = http.request({
		hostname: config.crud_host,
		port: config.crud_port,
		auth: `${config.crud_user}:${config.crud_pw}`,
		method: 'PUT',
		headers: {'Content-Type': 'application/json'},
		path: '/webpad/documents'
	}, function(response){
		logger.debug(response.statusCode);
		response.on('data', function(chunk){
			mesg += chunk;
		});
		response.on('end', function(){
			logger.debug(mesg);
			res.send(mesg);
		});
	});
	request.on('error', function(e){
		logger.error(e);
	});
	logger.debug(JSON.stringify(payload));
	request.write(JSON.stringify(payload));
	request.end();
});

router.delete(/\/(\w+(?:\/\w+)*(?:\/)?)$/, function(req, res){
	logger.debug(req.params[0]);
	const selector = `name=${req.params[0]}`;
	logger.debug(selector);

	let mesg = '';
	const request = http.request({
		hostname: config.crud_host,
		port: config.crud_port,
		auth: `${config.crud_user}:${config.crud_pw}`,
		method: 'DELETE',
		headers: {'Content-Type': 'application/json'},
		path: `/webpad/documents?${selector}`
	}, function(response){
		logger.debug(response.statusCode);
		response.on('data', function(chunk){
			mesg += chunk;
		});
		response.on('end', function(){
			logger.debug(mesg);
			res.send(mesg);
		});
	});
	request.on('error', function(e){
		logger.error(e);
	});
	request.write(JSON.stringify(selector));
	request.end();
});

module.exports = router;

