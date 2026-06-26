# Avala — probar una llamada de pago con cabecera X-Payment
# Uso:
#   .\scripts\test-paid-call.ps1 -TxHash 0xabc...def
#   .\scripts\test-paid-call.ps1 -Wait   # espera una nueva tx de 0.002 pathUSD

param(
    [string]$TxHash = "",
    [switch]$Wait,
    [string]$ApiUrl = "http://localhost:8787",
    [string]$PayTo = "0x4d6EA964A066058a59f6156116E29308D9ec5EF7",
    [string]$RpcUrl = "https://rpc.moderato.tempo.xyz",
    [int]$ChainId = 42431
)

$ErrorActionPreference = "Stop"
$pathUsd = "0x20c0000000000000000000000000000000000000"
$amountAtomic = "0x7d0"  # 2000 = 0.002 pathUSD
$bodyFile = Join-Path $env:TEMP "avala-validate.json"
'{"country":"ES","value":"12345678Z"}' | Out-File -Encoding ascii $bodyFile -NoNewline

function Invoke-Rpc($method, $params) {
    $payload = @{ jsonrpc = "2.0"; method = $method; params = $params; id = 1 } | ConvertTo-Json -Compress
    $tmp = [System.IO.Path]::GetTempFileName()
    $payload | Out-File -Encoding ascii $tmp -NoNewline
    $raw = curl.exe -s -X POST $RpcUrl -H "content-type: application/json" --data "@$tmp"
    Remove-Item $tmp -Force
    ($raw | ConvertFrom-Json).result
}

function Get-RecentPaymentTxHashes {
    $latestHex = Invoke-Rpc "eth_blockNumber" @()
    $latest = [Convert]::ToInt64($latestHex, 16)
    $from = "0x" + ($latest - 50000).ToString("x")
    $recipient = "0x" + ("000000000000000000000000" + $PayTo.Replace("0x", "").ToLower())
    $query = @"
{"jsonrpc":"2.0","method":"eth_getLogs","params":[{"address":"$pathUsd","topics":["0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",null,"$recipient"],"fromBlock":"$from","toBlock":"latest"}],"id":1}
"@
    $tmp = [System.IO.Path]::GetTempFileName()
    $query | Out-File -Encoding ascii $tmp -NoNewline
    $raw = curl.exe -s -X POST $RpcUrl -H "content-type: application/json" --data "@$tmp"
    Remove-Item $tmp -Force
    $json = $raw | ConvertFrom-Json
    if ($json.error) { return @() }
    @($json.result | Where-Object { $_.data -eq $amountAtomic } | ForEach-Object { $_.transactionHash })
}

function Test-PaidCall([string]$hash) {
    Write-Host "`n=== Probando pago con tx $hash ===`n" -ForegroundColor Cyan
    $header = "${hash}:${ChainId}"
    $out = curl.exe -s -w "`nHTTP:%{http_code}" -X POST "$ApiUrl/v1/validate-tax-id" `
        -H "content-type: application/json" `
        -H "X-Payment: $header" `
        --data "@$bodyFile"
    Write-Host $out
    if ($out -match "HTTP:200") {
        Write-Host "`nExito: pago verificado y validacion completada." -ForegroundColor Green
        return 0
    }
    Write-Host "`nNo se obtuvo HTTP 200. Revisa el mensaje arriba." -ForegroundColor Yellow
    return 1
}

if ($Wait) {
    Write-Host "Esperando una nueva transferencia de 0.002 pathUSD a $PayTo ..."
    Write-Host "En MetaMask: Enviar -> pega tu direccion -> 0.002 pathUSD -> Confirmar`n"
    $known = @(Get-RecentPaymentTxHashes)
    Write-Host "Tx conocidas: $($known.Count). Polling cada 5s (Ctrl+C para cancelar)...`n"
    while ($true) {
        Start-Sleep -Seconds 5
        $current = @(Get-RecentPaymentTxHashes)
        $new = @($current | Where-Object { $_ -notin $known })
        if ($new.Count -gt 0) {
            $TxHash = $new[-1]
            Write-Host "Nueva tx detectada: $TxHash" -ForegroundColor Green
            break
        }
        Write-Host "." -NoNewline
    }
}

if (-not $TxHash) {
    Write-Host "Indica -TxHash 0x... o usa -Wait tras enviar en MetaMask."
    Write-Host "Ejemplo: .\scripts\test-paid-call.ps1 -TxHash 0xabc...def"
    exit 1
}

exit (Test-PaidCall $TxHash)
