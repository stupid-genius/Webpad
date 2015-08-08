var logger = require('winston');
var util = require('util');

module.exports = function(req, res, next){
	logger.log('info', 'update on db: %s, collection: %s', req.params[0], req.params[1]);
	logger.log('info', req.body);
	// http://docs.mongodb.org/manual/reference/method/db.collection.update/#examples
	req.db.db(req.params[0]).collection(req.params[1]).update(req.body[0], req.body[1], req.body[2], function(err, result){
		if(err){
			logger.log('error', err);
		}
		req.db.close();
		res.send();	// return new docs
	});
};
