var express = require('express');
var router = express.Router();
var authCheck = require('./check-authentication');

router.get('/', function(req, res){
	res.redirect('/doc/');
});
router.use('/doc', require('./doc'));
router.use('/txt', require('./txt'));
router.use('/vim', require('./ace'));
/* ideas
router.use('/md');		// markdown
router.use('/src');		// syntax highlighting
router.use('/enc');		// encode in specified scheme
router.use('/dec');		// decode as specified scheme
router.use('/edit');	// rich editor
router.use('/crud');	// CRUD UI

router.use('/admin');	// admin
router.use('/user');	// user profile/mang.

router.use('/look');	// various lookups (ASCII, unicode, etc.)

router.use('/term');	// terminal
router.use('/chat');	// establish socket (broadcast, channel)
router.use('/irc');		// IRC
router.use('/gnet');	// GNUnet

router.use('/sock');	// socket service
router.use('/', router)	// monadic ui (/src/edit/, /md/chat/)
*/

router.post(/\/c\/(\w+)\/(\w+)$/, authCheck, require('./create'));
router.post(/\/r\/(\w+)\/(\w+)$/, authCheck, require('./read'));
router.post(/\/u\/(\w+)\/(\w+)$/, authCheck, require('./update'));
router.post(/\/d\/(\w+)\/(\w+)$/, authCheck, require('./delete'));

module.exports = router;
