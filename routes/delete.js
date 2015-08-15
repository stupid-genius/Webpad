var logger = require('winston');

module.exports = function(req, res, next){
	logger.log('info', 'delete on db: %s, collection: %s', req.params[0], req.params[1]);
	logger.log('debug', req.body);
	req.db.db(req.params[0]).collection(req.params[1]).remove(req.body, {w:1}, function(err, result){
		if(err){
			logger.log('error', err);
			req.db.close();
			res.end();
			return;
		}
		req.db.close();
		res.send();
	});
};
