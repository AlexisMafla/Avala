# Avala smoke test against a deployed or local instance
param(
    [string]$BaseUrl = "http://localhost:8787"
)

$ErrorActionPreference = "Continue"
$base = $BaseUrl.TrimEnd("/")
$failed = 0

function Test-Endpoint($name, $script) {
    Write-Host "  $name... " -NoNewline
    try {
        & $script
        Write-Host "OK" -ForegroundColor Green
    } catch {
        Write-Host "FAIL" -ForegroundColor Red
        Write-Host "    $_" -ForegroundColor Yellow
        $script:failed++
    }
}

Write-Host "`n=== Avala smoke test ===" -ForegroundColor Cyan
Write-Host "Target: $base`n"

Test-Endpoint "GET /healthz" {
    $r = Invoke-RestMethod -Uri "$base/healthz" -TimeoutSec 15
    if (-not $r.ok) { throw "ok=false" }
}

Test-Endpoint "GET /services.json" {
    $r = Invoke-RestMethod -Uri "$base/services.json" -TimeoutSec 15
    if ($r.name -ne "avala") { throw "unexpected name" }
}

Test-Endpoint "GET / (HTML)" {
    $code = curl.exe -s -o NUL -w "%{http_code}" -H "Accept: text/html" "$base/"
    if ($code -ne "200") { throw "HTTP $code" }
}

'{"country":"ES","value":"12345678Z"}' | Out-File -Encoding ascii "$env:TEMP\avala-smoke.json" -NoNewline

Test-Endpoint "POST /v1/validate-tax-id (expect 402 or 200)" {
    try {
        Invoke-WebRequest -Uri "$base/v1/validate-tax-id" -Method POST `
            -ContentType "application/json" `
            -Body (Get-Content "$env:TEMP\avala-smoke.json" -Raw) `
            -TimeoutSec 15 | Out-Null
    } catch {
        $code = $_.Exception.Response.StatusCode.value__
        if ($code -ne 402 -and $code -ne 200) { throw "HTTP $code" }
    }
}

Write-Host ""
if ($failed -eq 0) {
    Write-Host "All checks passed." -ForegroundColor Green
    exit 0
}
Write-Host "$failed check(s) failed." -ForegroundColor Red
exit 1
