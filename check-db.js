const sql=require('mssql');
require('dotenv').config();
sql.connect({
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  options: {encrypt:false, trustServerCertificate:true}
}).then(pool => {
  return pool.request().query("SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='BAITAP'");
}).then(r => {
  console.log(r.recordset);
  process.exit(0);
}).catch(console.error);
