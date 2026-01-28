(async () => {
  try {
    const { getPool } = require('../mssql-config');
    const pool = await getPool();

    const tables = ['BAITAP','MONHOC','DANGBAI','DOKHO'];

    for (const t of tables) {
      console.log('\n--- TABLE:', t, '---');
      try {
        const colQ = `SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t}' ORDER BY ORDINAL_POSITION`;
        const colRes = await pool.request().query(colQ);
        console.log('COLUMNS:');
        console.table(colRes.recordset || []);

        const cntRes = await pool.request().query(`SELECT COUNT(*) AS cnt FROM ${t}`);
        console.log('ROWS:', (cntRes.recordset && cntRes.recordset[0] && cntRes.recordset[0].cnt) || 0);
      } catch (err) {
        console.error('Error querying table', t, ':', err.message || err);
      }
    }

    // close pool
    try { await pool.close(); } catch(e){}
    process.exit(0);
  } catch (err) {
    console.error('Fatal error (cannot connect or module):', err.message || err);
    process.exit(2);
  }
})();
