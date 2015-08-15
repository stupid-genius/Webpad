var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var serverLog = require('morgan');
var logger = require('winston');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('./config');
var routes = require('./routes/index');
//var users = require('./routes/user');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

// view engine setup

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(serverLog('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
//app.use('/users', users);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            host: config.public_root,
            message: err.message,
            error: err,
            page_title: 'error',
            initElem: null
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        host: config.public_root,
        message: err.message,
        error: {},
        page_title: 'error',
        initElem: null
    });
});

logger.add(logger.transports.File, {level:'warn', filename: 'webpad.log'})
logger.remove(logger.transports.Console);
//logger.level = 'warn';
module.exports = app;
