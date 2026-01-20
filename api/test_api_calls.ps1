Write-Output '=== CALL WITHOUT API KEY ==='
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:3002/grading/ctdl/criteria' -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
  Write-Output ("STATUS:$($r.StatusCode)")
  Write-Output $r.Content
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    $sc = $resp.StatusCode.value__
    $body = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    Write-Output ("STATUS:$sc")
    Write-Output $body
  } else {
    Write-Output 'ERROR:'
    Write-Output $_.Exception.Message
  }
}

Write-Output '=== CALL WITH API KEY ==='
try {
  $r2 = Invoke-WebRequest -Uri 'http://localhost:3002/grading/ctdl/criteria' -UseBasicParsing -Headers @{ 'x-api-key' = 'secret123' } -TimeoutSec 10 -ErrorAction Stop
  Write-Output ("STATUS:$($r2.StatusCode)")
  Write-Output $r2.Content
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    $sc = $resp.StatusCode.value__
    $body = (New-Object System.IO.StreamReader($resp.GetResponseStream())).ReadToEnd()
    Write-Output ("STATUS:$sc")
    Write-Output $body
  } else {
    Write-Output 'ERROR:'
    Write-Output $_.Exception.Message
  }
}
