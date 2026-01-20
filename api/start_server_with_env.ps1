$env:PORT = '3002'
$env:API_KEY = 'secret123'
Set-Location (Split-Path -Path $MyInvocation.MyCommand.Path)
Write-Output "Starting grading-api.js with PORT=$env:PORT and API_KEY present: $([bool]$env:API_KEY)"
node grading-api.js
