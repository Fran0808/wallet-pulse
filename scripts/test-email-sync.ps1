param (
    [string]$BaseUrl = "http://localhost:8080"
)

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "   SINCRONIZADOR DE CORREOS BANCARIOS (GMAIL / BCP)   " -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Probar conexion a la API
try {
    $health = Invoke-RestMethod -Uri "$BaseUrl/api/v1/emails/test-connection" -Method Get -TimeoutSec 15
    Write-Host "`n1. ESTADO DE CONEXION CON GMAIL:" -ForegroundColor Yellow
    Write-Host "   - Estado:                $($health.status)" -ForegroundColor Green
    Write-Host "   - Usuario:               $($health.connectedUser)"
    Write-Host "   - Correos BCP hallados:  $($health.matchedBcpEmailsCount)"
    Write-Host "   - Total en Bandeja:      $($health.totalInboxMessages)"
} catch {
    Write-Host "`n[ERROR] No se pudo conectar con el Backend en $BaseUrl." -ForegroundColor Red
    Write-Host "Asegúrate de que la API esté corriendo (./mvnw spring-boot:run)." -ForegroundColor Yellow
    exit 1
}

# 2. Ejecutar Sincronizacion
Write-Host "`n2. SINCRONIZANDO CORREOS Y GUARDANDO EN POSTGRESQL..." -ForegroundColor Yellow
try {
    $syncResult = Invoke-RestMethod -Uri "$BaseUrl/api/v1/emails/sync" -Method Post -TimeoutSec 30
    Write-Host "   - Escaneados:            $($syncResult.scannedCount)"
    Write-Host "   - Procesados en lote:    $($syncResult.processedInBatch)"
    Write-Host "   - Guardados con exito:   $($syncResult.savedCount)" -ForegroundColor Green

    if ($syncResult.transactions -and $syncResult.transactions.Count -gt 0) {
        Write-Host "`n3. TRANSACCIONES CAPTURADAS:" -ForegroundColor Green
        foreach ($tx in $syncResult.transactions) {
            Write-Host "   * [$($tx.flowType)] S/ $($tx.amount) en '$($tx.contactName)' ($($tx.channel)) - $($tx.transactionDate)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "`n[INFO] No hay transacciones nuevas (o ya estaban guardadas en la base de datos)." -ForegroundColor Gray
    }
} catch {
    Write-Host "`n[ERROR] Error al sincronizar correos: $_" -ForegroundColor Red
}

Write-Host "`n=======================================================" -ForegroundColor Cyan
