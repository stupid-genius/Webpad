var express = require('express');
var router = express.Router();
var authCheck = require('./check-authentication');
var logger = require('winston');

router.get('/', function(req, res){
    res.render('index', { title: 'MongoCRUD' });
});
router.get(/\/(\w+)\/(\w+)$/, function(req, res, next){req.basicPrompt = true;next();}, authCheck, function(req, res){
    res.render('crud', {title: 'MongoCRUD UI', db: req.params[0], collection: req.params[1]});
});
router.get('/logout', function(req, res){
    res.status(401);
    res.send();
});

module.exports = router;
