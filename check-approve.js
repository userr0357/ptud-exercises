const mssql = require('mssql');
const cfg = {
  server: '118.69.126.49', port: 1433,
  database: 'Data_PersonalizedSystem',
  user: 'userPersonalizedSystem', password: '123456789',
  options: { encrypt: false, trustServerCertificate: true }
};

mssql.connect(cfg).then(async pool => {
  // Check MONHOC table columns
  const r0 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='GIANGVIEN_MONHOC'");
  console.log('GIANGVIEN_MONHOC columns:', r0.recordset.map(c => c.COLUMN_NAME));

  // Check if LTBE exists in MONHOC
  const r1 = await pool.request().query("SELECT * FROM MONHOC WHERE MaMon='LTBE'");
  console.log('MONHOC LTBE:', JSON.stringify(r1.recordset));

  // Check if GV01 already assigned LTBE
  const r2 = await pool.request().query("SELECT * FROM GIANGVIEN_MONHOC WHERE MaGiangVien='GV01' AND MaMon='LTBE'");
  console.log('GV01-LTBE assignment:', JSON.stringify(r2.recordset));

  // Try simulating the approve transaction
  console.log('\n--- Simulating approve for Id=1 ---');
  const reqInfoR = await pool.request().input('id', mssql.Int, 1).query('SELECT * FROM YEUCAU_MONHOC WHERE Id=@id');
  const rd = reqInfoR.recordset[0];
  console.log('Request data:', JSON.stringify(rd));

  mssql.close();
}).catch(e => { console.error('ERR:', e.message); mssql.close(); });
