const express = require('express');
const sql = require('mssql');

const app = express();
const port = process.env.PORT || 3000;

// API key protection: if API_KEY is set in env, require requests to provide it
const API_KEY = process.env.API_KEY || null;
app.use((req, res, next) => {
  if (API_KEY) {
    const key = req.header('x-api-key') || req.query.api_key;
    if (!key || key !== API_KEY) return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Log whether API_KEY is set (do not print the key itself)
console.log('API_KEY present:', API_KEY ? 'yes' : 'no');

// SQL config: prefer env vars, fallback to known connection
const sqlConfig = {
  user: process.env.DB_USER || 'userPersonalizedSystem',
  password: process.env.DB_PASS || '123456789',
  server: process.env.DB_HOST || '118.69.126.49',
  database: process.env.DB_NAME || 'Data_PersonalizedSystem',
  options: {
    encrypt: false,
    enableArithAbort: true
  }
};

async function queryGradingCriteria(subjectPrefix) {
  // subjectPrefix e.g. 'CTDL_GT' (without trailing -)
  const pool = await sql.connect(sqlConfig);
  try {
    const res = await pool.request()
      .input('prefix', sql.NVarChar, subjectPrefix + '-%')
      .query(`SELECT ExerciseID, ExerciseCode, Title, Requirements, Description, GradingCriteria, SubmissionFormat
              FROM dbo.ptud_Exercises
              WHERE ExerciseCode LIKE @prefix
              ORDER BY ExerciseID`);
    return res.recordset;
  } finally {
    // do not close global connection; mssql pool handles it
  }
}

app.get('/grading/ctdl', async (req, res) => {
  try {
    const rows = await queryGradingCriteria('CTDL_GT');
    res.json({ count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed', detail: err.message });
  }
});

app.get('/grading/:subject', async (req, res) => {
  const subject = req.params.subject; // expects prefix like CTDL_GT
  try {
    const rows = await queryGradingCriteria(subject);
    res.json({ count: rows.length, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed', detail: err.message });
  }
});

// Return only GradingCriteria for a subject prefix
app.get('/grading/:subject/criteria', async (req, res) => {
  const subject = req.params.subject; // e.g. CTDL_GT
  // normalize subject: allow callers to use 'ctdl' -> map to 'CTDL_GT'
  const subj = (subject || '').toUpperCase() === 'CTDL' ? 'CTDL_GT' : (subject || '').toUpperCase();
  try {
    const rows = await queryGradingCriteria(subj);
    // return only ExerciseCode and GradingCriteria fields
    const data = rows.map(r => ({ ExerciseCode: r.ExerciseCode, GradingCriteria: r.GradingCriteria }));
    res.json({ count: data.length, data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed', detail: err.message });
  }
});

app.listen(port, () => {
  console.log(`Grading API listening on port ${port}`);
});
