require('dotenv').config();
const sql = require('mssql');
const cfg = {
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true }
};

sql.connect(cfg).then(async pool => {
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='EXPORT_LOG' AND COLUMN_NAME='details')
    ALTER TABLE EXPORT_LOG ADD details NVARCHAR(MAX) NULL
  `);
  console.log('Column "details" added to EXPORT_LOG successfully');
  process.exit(0);
}).catch(e => { console.error('Error:', e.message); process.exit(1); });
