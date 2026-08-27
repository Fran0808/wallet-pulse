param (
    [decimal]$Amount = 25.00,
    [string]$Contact = "Juan Perez",
    [ValidateSet("Income", "Expense")]
    [string]$Type = "Income"
)

# Locate ADB executable in local Android SDK
$adbPath = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"

if (-not (Test-Path $adbPath)) {
    Write-Error "ADB not found at $adbPath. Please verify Android SDK installation."
    exit 1
}

# Format amount with 2 decimal places
$formattedAmount = "{0:N2}" -f $Amount

# Construct notification parameters according to flow type
if ($Type -eq "Income") {
    $title = "Te yapearon"
    $text = "$Contact te envio S/ $formattedAmount a tu Yape"
    $tag = "yape_income_$(Get-Random)"
} else {
    $title = "Yapeaste"
    $text = "Yapeaste S/ $formattedAmount a $Contact"
    $tag = "yape_expense_$(Get-Random)"
}

Write-Host "Simulating $Type notification:" -ForegroundColor Cyan
Write-Host "  Title  : $title"
Write-Host "  Text   : $text"
Write-Host "  Amount : S/ $formattedAmount"
Write-Host "  Contact: $Contact"

# Post notification to Android device via ADB shell
& $adbPath shell "cmd notification post -S bigtext -t '$title' '$tag' '$text'"

Write-Host "Notification dispatched successfully." -ForegroundColor Green

#.\scripts\simulate-transaction.ps1 -Amount 75.50 -Contact "Carlos Mendoza" -Type Income
#.\scripts\simulate-transaction.ps1 -Amount 20.00 -Contact "Farmacia Universal" -Type Expense