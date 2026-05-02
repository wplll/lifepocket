$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..\..\..")
$adb = Join-Path $repoRoot ".tmp\android-platform-tools\platform-tools\adb.exe"
$logPath = Join-Path $repoRoot ".tmp\android-crash.log"
$packageName = "com.lifepocket.mobile"

if (!(Test-Path $adb)) {
  throw "adb.exe not found at $adb"
}

Write-Host "Checking connected devices..."
& $adb devices -l

Write-Host "Clearing logcat..."
& $adb logcat -c

Write-Host "Starting $packageName..."
& $adb shell am force-stop $packageName
& $adb shell monkey -p $packageName -c android.intent.category.LAUNCHER 1

Write-Host "Waiting for crash logs..."
Start-Sleep -Seconds 8

& $adb logcat -d -v time |
  Select-String -Pattern "FATAL EXCEPTION|AndroidRuntime|ReactNativeJS|ReactNative|Hermes|SoLoader|Expo|$packageName" -Context 8,40 |
  Out-File $logPath -Encoding UTF8

Write-Host "Saved crash log to $logPath"
Get-Content $logPath -Tail 220
