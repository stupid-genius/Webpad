const packageJson = require(process.env.npm_package_json);

module.exports = Object.freeze({
	appName: packageJson.name,
	appDescription: packageJson.description,
	appVersion: packageJson.version,
	crud_host: process.env.CRUDHOST || 'api',
	crud_port: process.env.CRUDPORT || 3000,
	crud_user: 'webpad-admin',
	crud_pw: 'correcthorsebatterystaple',
	dbHost: process.env.DBHOST || 'mongo',
	dbPort: process.env.DBPORT || 27017,
	logFile: process.env.LOGFILE || 'app.log',
	logLevel: process.env.LOGLEVEL || (process.env.NODE_ENV==='development'?'debug':'info'),
	nodeEnv: process.env.NODE_ENV || 'not set'
});
