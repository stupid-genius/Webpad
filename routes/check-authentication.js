var mc = require('mongodb').MongoClient;
var logger = require('winston');

var host = 'localhost';
var port = 27017;

module.exports = function(req, res, next){
	var header	= req.headers['authorization']||'',			// get the header
		token	= header.split(/\s+/).pop()||'',			// and the encoded auth token
		auth	= new Buffer(token, 'base64').toString(),	// convert from base64
		parts	= auth.split(/:/),							// split on colon
		username=parts[0],
		password=parts[1];

	mc.connect('mongodb://'+host+':'+port, function(err, db){
		logger.log('info', 'authenticating against %s', req.params[0]);
		db.db(req.params[0]).authenticate(username, password, function(err, result){
			if(err){
				logger.log('warn', err);
				db.close();
				res.status(401);
				if(req.basicPrompt){
					res.setHeader('WWW-Authenticate', 'Basic');
				}
				res.send('authentication failed');
				return;
			}
			logger.log('info', '%s authenticated', username);
			req.db = db;
			next();
		});
	});
};
