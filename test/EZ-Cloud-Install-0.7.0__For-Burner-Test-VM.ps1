# ###################################
# EZ-Cloud-Install-0.7.0__For-Burner-Test-VM.ps1
# ####
# Goal: Quick preparation of a test / burner VM
# ####
# v1.0 - 2021.09.14 - Tony Massé
# ####
# - Installs NodeJS
# - Installs EZ Cloud v0.7.0
# - Runs EZ Cloud on 0.0.0.0:4430
# - Connect to it with Chrome
# - Install VS Code
# - Open EZ Cloud folder in VS Code
# ###################################

# Go to the Desktop
write-host "Go to the Desktop..."
cd $Env:USERPROFILE\Desktop

# Move to the modern time... Use TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# Get and install NodeJS v14.17.6
write-host "Download NodeJS..."
if (Test-Path "node-v14.17.6-x64.msi") { Remove-Item "node-v14.17.6-x64.msi" }
Invoke-WebRequest -Uri "https://nodejs.org/dist/v14.17.6/node-v14.17.6-x64.msi" -OutFile "node-v14.17.6-x64.msi"
write-host "Install NodeJS..."
Start-Process "MsiExec.exe" "/i node-v14.17.6-x64.msi /qn" -Wait
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 

# Get v0.7.0 of EZ Cloud
write-host "Download EZ Cloud..."
if (Test-Path "V0.7.0.zip") { Remove-Item "V0.7.0.zip" }
Invoke-WebRequest -Uri "https://github.com/TonyMasse/EZ-Cloud/archive/refs/heads/V0.7.0.zip" -OutFile "V0.7.0.zip"
write-host "Decompress EZ Cloud..."
Expand-Archive -Path "V0.7.0.zip" -DestinationPath .\

# Deploy the SQL database
write-host "Deploy the SQL database for EZ Cloud..."
cd .\EZ-Cloud-0.7.0\database\
Start-Process "create_database.bat" -Wait
cd ..

# Bring all the NPM packages to the yard...
write-host "Bring all the NPM packages to the yard..."
npm install

# Prepare the Configuration for the EZ Cloud Server
write-host "Prepare the Configuration for the EZ Cloud Server..."
Copy-Item -Path "config.dist" -Destination "config" -Recurse
(Get-Content "config\database.json") -replace '(?<="password":")CHANGE_ME', (Read-Host "Enter SA Password") | Set-Content "config\database.json"
# (Get-Content "config\secure.json") -replace '(?<="aes_secret": ")[^"]*', (Read-Host "(AES Encryption seed) Enter a long string of random characters") | Set-Content "config\secure.json"
(Get-Content "config\secure.json") -replace '(?<="aes_secret": ")[^"]*', ( -join ((35..91) + (97..126) | Get-Random -Count 120 | % {{[char]$_}})) | Set-Content "config\secure.json"
# (Get-Content "config\jwt.json") -replace '(?<="secret": ")[^"]*', (Read-Host "(JWT Encryption Private Key) Enter a long string of random characters") | Set-Content "config\jwt.json"
(Get-Content "config\jwt.json") -replace '(?<="secret": ")[^"]*', ( -join ((35..91) + (97..126) | Get-Random -Count 80 | % {{[char]$_}})) | Set-Content "config\jwt.json"
# Set default listening Host to all IPs (0.0.0.0:4430), and start the EZ Cloud Server (in a separate window)
write-host "Set default listening Host to all IPs (0.0.0.0:4430), and start the EZ Cloud Server (in a separate window)..."
$Env:HOST=0.0.0.0
$Env:PORT=4430
Start-Process "npm" "start"

# Open it in Chrome
write-host "Open it in Chrome..."
[system.Diagnostics.Process]::Start("chrome","https://localhost:4430")

# Download VS Code
write-host "Download VS Code..."
if (Test-Path "VSCodeUserInstall_Stable_64.exe") { Remove-Item "VSCodeUserInstall_Stable_64.exe" }
Invoke-WebRequest -Uri "https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user" -OutFile "VSCodeUserInstall_Stable_64.exe"

# Install VS Code
write-host "Install VS Code..."
Start-Process "VSCodeUserInstall_Stable_64.exe" "/VERYSILENT /MERGETASKS=!runcode" -Wait
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User") 

# Open EZ-Cloud folder with VS Code
write-host "Open EZ-Cloud folder with VS Code..."
Start-Process "code" "EZ-Cloud-0.7.0"
