# Launch only after the final .2 runtime is installed and root requests QA.
$qaRoot = $PSScriptRoot
$qaProfile = Join-Path $qaRoot 'chrome-performance-profile'
$qaReceiptPath = Join-Path $qaRoot 'chrome-launch.json'
if (Test-Path -LiteralPath $qaProfile) { throw 'Fresh dedicated QA profile already exists; preserve it before retrying.' }
if (Test-Path -LiteralPath $qaReceiptPath) { throw 'Preserve the earlier QA launch receipt before retrying.' }
$qaArgs = @('--headless=new','--mute-audio','--no-first-run','--no-default-browser-check','--disable-extensions','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding','--disable-features=CalculateNativeWinOcclusion','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9227',('--user-data-dir="' + $qaProfile + '"'),'about:blank')
$qaProcess = Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList $qaArgs -WindowStyle Hidden -PassThru
$qaReceipt = [ordered]@{ muted = $true; debugger = 'http://127.0.0.1:9227'; profile = $qaProfile; pid = $qaProcess.Id; arguments = $qaArgs }
$qaReceipt | ConvertTo-Json -Depth 5 | Set-Content -LiteralPath $qaReceiptPath -Encoding utf8
$qaReceipt | ConvertTo-Json -Compress -Depth 5
