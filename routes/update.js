var logger = require('winston');

module.exports = function(req, res, next){
	logger.log('info', 'update on db: %s, collection: %s', req.params[0], req.params[1]);
	logger.log('info', req.body[0]);
	//req.db.db(req.params[0]).collection(req.params[1]);
	req.db.close();
	res.send('unsupported');
};
