param(
    [string]$RemoteUrl,
    [string]$Branch = "main",
    [string]$Token
)

function Fail([string]$msg){ Write-Host $msg -ForegroundColor Red; exit 1 }

# Ensure git exists
try { git --version > $null } catch { Fail "Git không được tìm thấy. Cài Git trước khi chạy script này." }

Push-Location -Path (Resolve-Path -LiteralPath .).Path

# Initialize repo if needed
$isRepo = $false
try { git rev-parse --is-inside-work-tree > $null 2>&1; $isRepo = $LASTEXITCODE -eq 0 } catch { $isRepo = $false }
if (-not $isRepo) {
    Write-Host "Chưa phải repository Git — sẽ khởi tạo." -ForegroundColor Yellow
    git init
}

# Stage changes
git add .

# Commit if there are changes
$status = git status --porcelain
if ($status) {
    git commit -m "Normalize subject counts: set total_exercises to 30"
} else {
    Write-Host "Không có thay đổi mới để commit." -ForegroundColor Green
}

if (-not $RemoteUrl) {
    $RemoteUrl = Read-Host "Nhập URL remote (ví dụ https://github.com/username/repo.git)"
}

# Prepare remote URL with token if provided
if ($Token) {
    if ($RemoteUrl -match '^https://') {
        $authUrl = $RemoteUrl -replace '^https://', "https://$Token@"
    } else {
        $authUrl = $RemoteUrl
    }
} else {
    $authUrl = $RemoteUrl
}

# Remove existing origin if present
try { git remote remove origin > $null 2>&1 } catch {}
git remote add origin $authUrl

git branch -M $Branch

Write-Host "Pushing to $RemoteUrl (branch $Branch)..." -ForegroundColor Cyan
try {
    git push -u origin $Branch
    Write-Host "Push thành công." -ForegroundColor Green
} catch {
    Fail "Push thất bại. Kiểm tra quyền truy cập hoặc URL remote."
}

Pop-Location
