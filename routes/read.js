var logger = require('winston');

module.exports = function(req, res, next){
	logger.log('info', 'read on db: %s, collection: %s', req.params[0], req.params[1]);
	req.db.db(req.params[0]).collection(req.params[1]).find(req.body).toArray(function(err, docs){
		if(err){
			logger.log('error', err);
			req.db.close();
			res.end();
			return;
		}
		req.db.close();
		res.send(docs);
	});
};
