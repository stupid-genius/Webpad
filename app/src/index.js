const express = require('express');
const morgan = require('morgan');
const servefavicon = require('serve-favicon');
const path = require('path');
const config = require('./config');
const Logger = require('./logger');

const logger = new Logger(path.basename(__filename));

const app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(morgan('common'));
app.use(servefavicon(path.join(__dirname, '../public/images/favicon.ico')));
app.use(require('./routes'));
app.use(express.static(path.join(__dirname, '../public')));

app.use((req, res, next) => {
	const err = new Error('Not Found');
	err.status = 404;
	next(err);
});

app.use((err, req, res) => {
	res.status(err.status || 500);
	res.render('error', {
		header_title: 'Error',
		error: logger.level === 'debug' ? err : {},
		message: err.message,
		title: 'Error'
	});
});

app.listen(3000, () => {
	logger.debug(`server running in ${config.nodeEnv} mode`);
	logger.info('server listening on port 3000');
});

