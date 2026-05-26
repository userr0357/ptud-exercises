require('dotenv').config({ path: 'c:/Users/Admin/Downloads/PTUD/DATN/.env' });
const sql = require('mssql');
async function run() {
  try {
    await sql.connect({
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_HOST,
      database: process.env.DB_NAME,
      port: 1433,
      options: { encrypt: false, trustServerCertificate: true }
    });
    const r = await sql.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='EXERCISE_AUDIT_LOG'");
    console.log(r.recordset);
  } catch(e) { console.error(e); }
  process.exit(0);
}
run();
