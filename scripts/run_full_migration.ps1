param(
  [string]$Server,
  [switch]$UseWindowsAuth = $true,
  [string]$Username,
  [string]$Password,
  [string]$Database = 'PTUD'
)

function Fail([string]$m){ Write-Host $m -ForegroundColor Red; exit 1 }

Push-Location -Path (Resolve-Path -LiteralPath $PSScriptRoot).Path


﻿if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Fail 'Node.js không được tìm thấy trên hệ thống. Cài Node.js trước khi chạy.'
}

Write-Host 'Sinh file INSERT-only từ db.json...' -ForegroundColor Cyan
node .\generate_insert_only_sql.js
if ($LASTEXITCODE -ne 0) { Fail 'Generator JS báo lỗi.' }

$insertFile = Join-Path $PSScriptRoot 'migrate_inserts.sql'
if (-not (Test-Path $insertFile)) { Fail "Không tìm thấy $insertFile" }

Write-Host "File insert đã sinh: $insertFile" -ForegroundColor Green

Write-Host 'Bắt đầu chạy migration (sẽ hỏi xác nhận) ...' -ForegroundColor Cyan
.\run_sql_migration.ps1 -Server $Server -InputSql $insertFile -UseWindowsAuth:$UseWindowsAuth -Username $Username -Password $Password -Database $Database

Pop-Location
