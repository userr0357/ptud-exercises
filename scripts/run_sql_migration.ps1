param(
  [string]$Server,
  [string]$InputSql = (Join-Path -Path $PSScriptRoot -ChildPath 'migrate_to_sqlserver.sql'),
  [switch]$UseWindowsAuth = $true,
  [string]$Username,
  [string]$Password,
  [string]$Database = 'PTUD'
)

function Fail([string]$msg){ 
  Write-Host $msg -ForegroundColor Red
  exit 1
}

# Check SQL file exists
if (-not (Test-Path $InputSql)) {
  Fail "SQL file not found: $InputSql"
}

# Ask for server if missing
if (-not $Server) {
  $Server = Read-Host 'Enter SQL Server instance (e.g. DESKTOP-ABC123\SQLEXPRESS or .\SQLEXPRESS)'
}

# Check sqlcmd installed
if (-not (Get-Command sqlcmd -ErrorAction SilentlyContinue)) {
  Fail "sqlcmd not found. Install 'SQL Server Command Line Utilities' or 'SQL Server Tools'."
}

Write-Host "Migration will run on server: $Server, database: $Database" -ForegroundColor Cyan
$ok = Read-Host "Continue and execute this SQL file on the selected server? (yes/no)"
if ($ok -notin @('y','Y','yes','Yes')) { 
  Write-Host "Cancelled by user."
  exit 0 
}

# Log file
$logPath = Join-Path -Path $PSScriptRoot -ChildPath ("migration_$(Get-Date -Format yyyyMMdd_HHmmss).log")
Write-Host "Writing log to: $logPath"

$argsList = @('-S', $Server, '-i', $InputSql, '-d', $Database)

# Authentication
if ($UseWindowsAuth) {
    $argsList += '-E'
} else {
    if (-not $Username) { 
        $Username = Read-Host 'SQL username'
    }
    if (-not $Password) { 
        $Password = Read-Host -AsSecureString 'SQL password'
        $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($Password)
        )
    }
    $argsList += ('-U', $Username, '-P', $Password)
}

try {
  Write-Host "Executing: sqlcmd $([string]::Join(' ', $argsList))" -ForegroundColor Yellow
  
  $output = & sqlcmd @argsList 2>&1 | Tee-Object -FilePath $logPath
  
  $exit = $LASTEXITCODE

  if ($exit -eq 0) { 
    Write-Host 'Migration completed successfully.' -ForegroundColor Green 
  }
  else { 
    Write-Host "sqlcmd returned error code $exit. Check log: $logPath" -ForegroundColor Red 
  }

} catch {
  Write-Host "Error while executing sqlcmd: $_" -ForegroundColor Red
  Write-Host "Log saved to: $logPath"
  exit 1
}

Write-Host "Last 40 lines of log:" -ForegroundColor Cyan
Get-Content $logPath -Tail 40 | ForEach-Object { Write-Host $_ }
