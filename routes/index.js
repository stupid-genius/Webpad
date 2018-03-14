var express = require('express');
var router = express.Router();
var authCheck = require('./check-authentication');

router.get('/', function(req, res){
	res.redirect('/doc/');
});
router.use('/edit', require('./edit'));
router.use('/txt', require('./txt'));
router.use('/vim', require('./ace'));
router.use('/doc', require('./tiny'));
router.use('/hot', require('./hot'));
/* ideas
router.use('/cas');		// CAS
router.use('/md');		// markdown
router.use('/src');		// syntax highlighting
router.use('/crud');	// CRUD UI (multi server: /mongo, /mysql, /redis)

router.use('/admin');	// admin
router.use('/user');	// user profile/mang.

router.use('/lookup');	// various lookups (ASCII, unicode, etc.)
router.use('/task');	// a todo list, each doc can contain notes about that task and can be broken down into sub tasks/docs
router.use('/finger');  // timestamp/punchclock/journal
router.use('/contact');	// contacts list

router.use('/term');	// terminal (w/cmds)
router.use('/chat');	// establish socket (broadcast, channel)
router.use('/irc'); 	// IRC
router.use('/gnet');	// GNUnet

router.use('/sock');	// socket service
router.use('/', router)	// monadic ui (/src/edit/, /md/chat/)
*/

router.post(/\/c\/(\w+)\/(\w+)$/, authCheck, require('./create'));
router.post(/\/r\/(\w+)\/(\w+)$/, authCheck, require('./read'));
router.post(/\/u\/(\w+)\/(\w+)$/, authCheck, require('./update'));
router.post(/\/d\/(\w+)\/(\w+)$/, authCheck, require('./delete'));

module.exports = router;
