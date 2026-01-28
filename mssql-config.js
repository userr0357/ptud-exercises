// mssql-config.js — removed. Do not use SQL migration files from this repo.
// This file was previously added for migration testing but has been intentionally disabled.
// Export null to cause a clear error if code tries to require it.
// MSSQL configuration helper
// - Reads connection settings from environment variables when available.
// - Provides a `getPool()` async function that returns a connected mssql ConnectionPool.
// - Defaults below use the server and user shown in the provided screenshot; change via
//   environment variables (DB_SERVER, DB_USER, DB_PASSWORD, DB_NAME) in production.

let sql = null;

function getSql() {
	if (!sql) {
		sql = require('mssql');
	}
	return sql;
}

const config = {
	user: process.env.DB_USER || 'userPersonalizedSystem',
	password: process.env.DB_PASSWORD || '123456789',
	server: process.env.DB_SERVER || '118.69.126.49',
		database: process.env.DB_NAME || 'Data_PersonalizedSystem', // default DB provided by user
	// options: adjust depending on your SQL Server setup
	options: {
		encrypt: false,
		trustServerCertificate: true
	},
	pool: {
		max: 10,
		min: 0,
		idleTimeoutMillis: 30000
	}
};

let pool = null;

async function getPool() {
	// Connect to database if not already connected
	if (pool && pool.connected) return pool;
	try {
		const sql = getSql();
		pool = await sql.connect(config);
		return pool;
	} catch (err) {
		console.error('Failed to connect to MSSQL:', err.message || err);
		throw err;
	}
}

module.exports = { getPool, getSql };
