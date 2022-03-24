db = db.getSiblingDB('admin')
db.createUser ({
	user: "admin",
	pwd: "correcthorsebatterystaple",
	"roles" : [
		"readWriteAnyDatabase",
		"dbAdminAnyDatabase"
	]
})

// db = db.getSiblingDB('webpad')
db.createUser ({
	user: "webpad-admin",
	pwd: "correcthorsebatterystaple",
	roles: [{
		role: "readWrite",
		db: "webpad"
	},
		{
			role: "dbAdmin",
			db: "webpad"
		}]
})
