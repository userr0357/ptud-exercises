const db = require('./db-sql.js');
db.getPool().then(pool => {
  return pool.request().query("SELECT COLUMN_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE, COLUMNPROPERTY(object_id('DANGBAI'), COLUMN_NAME, 'IsIdentity') as is_identity FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'DANGBAI'");
}).then(r => {
  console.log(r.recordset);
  process.exit(0);
}).catch(console.error);
