var logger = require('winston');

module.exports = function(req, res, next){
	logger.log('info', 'read on db: %s, collection: %s', req.params[0], req.params[1]);
	logger.log('debug', req.body);
	req.db.db(req.params[0]).collection(req.params[1]).find(req.body).toArray(function(err, docs){
		if(err){
			logger.log('error', err);
			req.db.close();
			res.end();
			return;
		}
		logger.log('info', docs);
		req.db.close();
		res.send(docs);
	});
};
