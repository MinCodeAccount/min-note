<#
.SYNOPSIS
  Register a daily Windows Scheduled Task that runs daily-investment.ps1.
.DESCRIPTION
  Pure ASCII on purpose (see daily-investment.ps1 note about PowerShell 5.1 codepage).
.PARAMETER Time
  Time of day (HH:mm). Default 22:00.
.PARAMETER TaskName
  Task name. Default "MinNote-DailyInvestment".
.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts\register-task.ps1 -Time 22:00
#>
[CmdletBinding()]
param(
    [string]$Time = '22:00',
    [string]$TaskName = 'MinNote-DailyInvestment'
)

$ErrorActionPreference = 'Stop'

$script = Join-Path $PSScriptRoot 'daily-investment.ps1'
if (-not (Test-Path $script)) {
    Write-Error "daily-investment.ps1 not found: $script"
    exit 1
}

$action = New-ScheduledTaskAction -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$script`""
$trigger = New-ScheduledTaskTrigger -Daily -At $Time
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
    -Settings $settings -Principal $principal `
    -Description 'min-note: generate daily investment article draft' -Force | Out-Null

Write-Host "==> Registered task '$TaskName' to run daily at $Time."
Write-Host "    Check : Task Scheduler -> Task Scheduler Library -> '$TaskName'"
Write-Host "    Remove: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
Write-Host "    Note  : local execution needs the PC on and logged in at that time."
