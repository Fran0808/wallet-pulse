param (
    [decimal]$Amount = 25.00,
    [string]$Contact = "Martha Qui*",
    [ValidateSet("Income", "Expense")]
    [string]$Type = "Income"
)

# Locate ADB executable in local Android SDK
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (-not (Test-Path $adbPath)) {
    Write-Error "ADB not found at $adbPath. Please verify Android SDK installation."
    exit 1
}

# Ensure ADB reverse port tunnel is active for backend sync
& $adbPath reverse tcp:8080 tcp:8080 | Out-Null

# Format amount with 2 decimal places
$formattedAmount = "{0:N2}" -f $Amount

# Construct notification parameters according to real Yape format
if ($Type -eq "Income") {
    $title = "Confirmación de Pago"
    $secCode = Get-Random -Minimum 100 -Maximum 999
    $text = "$Contact te envió un pago por S/ $formattedAmount. El cód. de seguridad es: $secCode"
    $tag = "yape_income_$(Get-Random)"
} else {
    $title = "Yapeaste"
    $text = "Yapeaste S/ $formattedAmount a $Contact"
    $tag = "yape_expense_$(Get-Random)"
}

Write-Host "Simulating $Type notification (Real Yape Format):" -ForegroundColor Cyan
Write-Host "  Title  : $title"
Write-Host "  Text   : $text"
Write-Host "  Amount : S/ $formattedAmount"
Write-Host "  Contact: $Contact"

# Post notification to Android device via ADB shell
& $adbPath shell "cmd notification post -S bigtext -t '$title' '$tag' '$text'"

Write-Host "Notification dispatched successfully." -ForegroundColor Green

# Usage Examples:
# .\scripts\simulate-transaction.ps1 -Amount 75.50 -Contact "Carlos Mendoza" -Type Income
# .\scripts\simulate-transaction.ps1 -Amount 20.00 -Contact "Farmacia Universal" -Type Expense