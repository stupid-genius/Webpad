var express = require('express');
var router = express.Router();
var authCheck = require('./check-authentication');

router.get('/', function(req, res){
	res.redirect('/doc/');
});
router.use('/doc', require('./doc'));
router.use('/txt', require('./txt'));

router.post(/\/c\/(\w+)\/(\w+)$/, authCheck, require('./create'));
router.post(/\/r\/(\w+)\/(\w+)$/, authCheck, require('./read'));
router.post(/\/u\/(\w+)\/(\w+)$/, authCheck, require('./update'));
router.post(/\/d\/(\w+)\/(\w+)$/, authCheck, require('./delete'));

module.exports = router;
