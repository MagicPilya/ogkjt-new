param(
  [Parameter(Mandatory = $true)]
  [string]$HostName,
  [Parameter(Mandatory = $true)]
  [string]$UserName,
  [Parameter(Mandatory = $true)]
  [string]$Port,
  [Parameter(Mandatory = $true)]
  [string]$SshKey,
  [Parameter(Mandatory = $false)]
  [string]$SshKeyB64,
  [Parameter(Mandatory = $true)]
  [string]$LocalArchivePath,
  [Parameter(Mandatory = $true)]
  [string]$RemoteArchivePath,
  [Parameter(Mandatory = $true)]
  [string]$LocalScriptPath,
  [Parameter(Mandatory = $true)]
  [string]$RemoteScriptPath,
  [Parameter(Mandatory = $true)]
  [string]$PrecheckCommand
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$keyPath = Join-Path $env:RUNNER_TEMP "cpanel_deploy_key"

try {
  if (-not [string]::IsNullOrWhiteSpace($SshKeyB64)) {
    [System.IO.File]::WriteAllBytes($keyPath, [System.Convert]::FromBase64String($SshKeyB64))
  } else {
    $keyBody = $SshKey.Trim()
    $keyBody = $keyBody -replace "\\n", "`n"
    $keyBody = $keyBody -replace "`r", ""
    if (($keyBody -notmatch "-----BEGIN OPENSSH PRIVATE KEY-----") -and ($keyBody -notmatch "-----BEGIN RSA PRIVATE KEY-----")) {
      throw "CPANEL_SSH_KEY must be an OpenSSH/RSA private key (not .ppk/public key)."
    }
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($keyPath, $keyBody, $utf8NoBom)
  }

  icacls $keyPath /inheritance:r | Out-Null
  icacls $keyPath /grant:r "$env:USERNAME`:R" | Out-Null

  $sshExe = (Get-Command ssh -ErrorAction SilentlyContinue).Source
  $scpExe = (Get-Command scp -ErrorAction SilentlyContinue).Source
  if (-not $sshExe) {
    $gitSsh = Join-Path ${env:ProgramFiles} "Git\usr\bin\ssh.exe"
    if (Test-Path $gitSsh) { $sshExe = $gitSsh }
  }
  if (-not $scpExe) {
    $gitScp = Join-Path ${env:ProgramFiles} "Git\usr\bin\scp.exe"
    if (Test-Path $gitScp) { $scpExe = $gitScp }
  }
  if (-not $sshExe -or -not $scpExe) {
    throw "ssh/scp not found. Install OpenSSH Client or Git for Windows on the runner."
  }

  & $sshExe -i $keyPath -p $Port -o StrictHostKeyChecking=accept-new "$UserName@$HostName" $PrecheckCommand
  if ($LASTEXITCODE -ne 0) { throw "SSH pre-check failed" }

  & $scpExe -i $keyPath -P $Port -o StrictHostKeyChecking=accept-new $LocalArchivePath "$UserName@$HostName`:$RemoteArchivePath"
  if ($LASTEXITCODE -ne 0) { throw "SCP archive upload failed" }

  & $scpExe -i $keyPath -P $Port -o StrictHostKeyChecking=accept-new $LocalScriptPath "$UserName@$HostName`:$RemoteScriptPath"
  if ($LASTEXITCODE -ne 0) { throw "SCP script upload failed" }

  & $sshExe -i $keyPath -p $Port -o StrictHostKeyChecking=accept-new "$UserName@$HostName" "chmod +x $RemoteScriptPath && bash $RemoteScriptPath && rm -f $RemoteScriptPath"
  if ($LASTEXITCODE -ne 0) { throw "Remote deploy command failed" }
}
finally {
  if (Test-Path $keyPath) {
    Remove-Item -Force $keyPath -ErrorAction SilentlyContinue
  }
}
