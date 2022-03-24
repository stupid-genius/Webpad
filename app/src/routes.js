const bodyParser = require('body-parser');
const { Buffer } = require('buffer');
const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const config = require('./config');
const Logger = require('./logger');

/* eslint-disable-next-line no-undef */
const logger = new Logger(path.basename(__filename));
const router = express.Router();

function parseAuthHeader(authorization = ''){
	let token = authorization.split(/\s+/).pop()||'',
		auth = Buffer.from(token, 'base64').toString(),
		parts = auth.split(/:/);
	return {
		username: parts[0],
		password: parts[1]
	};
}

// this is the only way to open a connection to the db
async function authCheck(req, res, next) {
	const { username, password } = parseAuthHeader(req.headers['authorization']);
	logger.info(`Authenticating access to  ${req.originalUrl}`);

	if(config.nodeEnv === 'development'){
		logger.info('skipping authentication');
		next();
	}else{
		let mc;
		try{
			const connString = `mongodb://${username}:${password}@${config.dbHost}:${config.dbPort}/?authMechanism=DEFAULT`;
			logger.info(`authenticating against ${connString}`);

			mc = new MongoClient(connString);
			await mc.connect();
			await mc.db('admin').command({ ping: 1 });
			logger.info(`authenticated user ${username}`);
			req.db = mc;
			next();
		}catch(err){
			logger.warn(err);
			res.status(401);
			if(username === undefined || password === undefined){
				res.setHeader('WWW-Authenticate', 'Basic');
			}
			res.send('authentication failed');
			if(mc){
				await mc.close();
			}
		}
	}
}

router.use(authCheck);
router.use(bodyParser.json());
router.get('/', (req, res) => {
	res.redirect('/doc/');
});

router.use('/doc', require('./tiny'));
router.use('/edit', require('./edit'));
router.use('/hot', require('./hot'));
router.use('/txt', require('./txt'));
router.use('/vim', require('./ace'));

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
read from vimwiki
*/

module.exports = router;

