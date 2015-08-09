var express = require('express');
var router = express.Router();
var authCheck = require('./check-authentication');

/* GET home page. */
router.get('/', function(req, res){
    res.render('index', { title: 'MongoCRUD' });
});
router.use('/crud', require('./crud'));

router.post(/\/c\/(\w+)\/(\w+)$/, authCheck, require('./create'));
router.post(/\/r\/(\w+)\/(\w+)$/, authCheck, require('./read'));
router.post(/\/u\/(\w+)\/(\w+)$/, authCheck, require('./update'));
router.post(/\/d\/(\w+)\/(\w+)$/, authCheck, require('./delete'));

module.exports = router;
