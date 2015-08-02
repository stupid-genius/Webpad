var express = require('express');
var router = express.Router();
var authCheck = require('./check-authentication');

/* GET home page. */
router.get('/', function(req, res){
    res.render('index', { title: 'MongoCRUD' });
});
router.get(/\/crud\/(\w+)\/(\w+)$/, function(req, res, next){req.basicPrompt = true;next();}, authCheck, function(req, res){
    res.render('crud', {title: 'MongoCRUD UI', db: req.params[0], collection: req.params[1]});
});
router.get('/logout', function(req, res){
    res.status(401);
    res.send();
});

router.post(/\/c\/(\w+)\/(\w+)$/, authCheck, require('./create'));
router.post(/\/r\/(\w+)\/(\w+)$/, authCheck, require('./read'));
router.post(/\/u\/(\w+)\/(\w+)$/, authCheck, require('./update'));
router.post(/\/d\/(\w+)\/(\w+)$/, authCheck, require('./delete'));

module.exports = router;
