API Grading Criteria (ptud_Exercises)

Endpoints:
- GET /grading/ctdl  -> returns grading criteria and related fields for exercises with codes CTDL_GT-***
- GET /grading/:subject -> subject prefix e.g. KTLT, NMTL, LTHDT, SQLQuery1

Setup & Run:
1. Open a terminal in `d:/3/PTUD/api`.
2. Install dependencies:

```bash
npm install
```

3. Configure connection by env vars or edit defaults in `grading-api.js`:
- `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`.

4. Start server:

```bash
npm start
```

5. Example request:

```bash
curl http://localhost:3000/grading/ctdl
```

Notes:
- Server uses the existing `dbo.ptud_Exercises` table.
- The script returns `ExerciseID, ExerciseCode, Title, Requirements, Description, GradingCriteria, SubmissionFormat` for each exercise.
