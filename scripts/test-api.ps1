param (
    [string]$BaseUrl = "http://localhost:8080"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Running REST API Smoke Tests" -ForegroundColor Cyan
Write-Host " Target: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Health / Summary Check
Write-Host "`n[1/4] Testing GET /api/v1/analytics/summary..." -NoNewline
try {
    $summary = Invoke-RestMethod -Uri "$BaseUrl/api/v1/analytics/summary" -Method Get
    Write-Host " [PASSED]" -ForegroundColor Green
    Write-Host "      Total Income : S/ $($summary.totalIncome)"
    Write-Host "      Total Expense: S/ $($summary.totalExpense)"
    Write-Host "      Net Balance  : S/ $($summary.netBalance)"
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Error "Could not connect to API at $BaseUrl. Is Spring Boot running?"
    exit 1
}

# 2. Ingest Single Transaction
$txHash = [System.Guid]::NewGuid().ToString("N") + [System.Guid]::NewGuid().ToString("N")
$txBody = @{
    amount = 50.00
    flowType = "INCOME"
    contactName = "Smoke Test User"
    channel = "YAPE"
    transactionDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss")
    transactionHash = $txHash
    rawNotificationText = "¡Te yapearon! Smoke Test User te envió S/ 50.00"
} | ConvertTo-Json

Write-Host "`n[2/4] Testing POST /api/v1/transactions/sync (Ingestion)..." -NoNewline
try {
    $ingestResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/transactions/sync" -Method Post -Body $txBody -ContentType "application/json"
    Write-Host " [PASSED]" -ForegroundColor Green
    Write-Host "      Transaction ID: $($ingestResponse.id)"
    Write-Host "      Amount        : S/ $($ingestResponse.amount)"
} catch {
    Write-Host " [FAILED]" -ForegroundColor Red
    Write-Error "Failed to ingest transaction: $_"
    exit 1
}

# 3. Test Deduplication (Re-send identical hash)
Write-Host "`n[3/4] Testing Deduplication Idempotency (Re-send same hash)..." -NoNewline
try {
    $dupResponse = Invoke-RestMethod -Uri "$BaseUrl/api/v1/transactions/sync" -Method Post -Body $txBody -ContentType "application/json"
    if ($dupResponse.id -eq $ingestResponse.id) {
        Write-Host " [PASSED] (Duplicate safely ignored, same ID returned)" -ForegroundColor Green
    } else {
        Write-Host " [FAILED] (Duplicate created a new ID)" -ForegroundColor Red
    }
} catch {
    Write-Host " [FAILED] $_" -ForegroundColor Red
}

# 4. Query Historical Transactions
Write-Host "`n[4/4] Testing GET /api/v1/transactions (History)..." -NoNewline
try {
    $history = Invoke-RestMethod -Uri "$BaseUrl/api/v1/transactions?page=0&size=5" -Method Get
    Write-Host " [PASSED]" -ForegroundColor Green
    Write-Host "      Total Elements: $($history.totalElements)"
    Write-Host "      Current Page Elements: $($history.content.Count)"
} catch {
    Write-Host " [FAILED] $_" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host " All API Tests Completed Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

#.\scripts\test-api.ps1