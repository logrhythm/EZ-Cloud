[Setup]
AppName=EZ-Cloud - Backend Server
AppVersion={#Version}
DefaultDirName={autopf64}\EZ Cloud Server
DefaultGroupName=EZ Cloud - Server

[Types]
Name: "full"; Description: "Full installation (EZ Cloud Server + Frontend + NodeJS)"
Name: "lrCloud"; Description: "LR Cloud installation (EZ Cloud Server + NodeJS)"
Name: "compact"; Description: "Compact installation (EZ Cloud Server + Frontend)"
Name: "minimal"; Description: "Minimal installation (EZ Cloud Server)"
Name: "custom"; Description: "Custom installation"; Flags: iscustom

[Components]
Name: "ezCloudServer"; Description: "EZ Cloud Server"; Types: full lrCloud compact minimal custom; Flags: fixed
Name: "ezCloudFrontend"; Description: "EZ Cloud Frontend"; Types: full compact custom
Name: "nodeJs"; Description: "NodeJS"; Types: full lrCloud custom

[Tasks]
Name: createDatabase; Description: "Create and Configure [EZ] SQL Database"; GroupDescription: "Database:"; Components: ezCloudServer
Name: serviceSetup; Description: "Configure EZ Server Service"; GroupDescription: "Service:"; Components: ezCloudServer
Name: serviceStart; Description: "Start EZ Server Service immediately"; GroupDescription: "Service:"; Components: ezCloudServer; Flags: unchecked
Name: autoGenerateTokens; Description: "Automatically &generate private tokens"; GroupDescription: "Private tokens:"; Components: ezCloudServer
Name: autoGenerateTokens\jwt; Description: "For &JWT (Authentication token encryption/decripion key)"; GroupDescription: "Private tokens:"; Components: ezCloudServer
Name: autoGenerateTokens\aes; Description: "For &AES (Encryption / Decryption private key)"; GroupDescription: "Private tokens:"; Components: ezCloudServer
Name: openConfigFileDatabase_json; Description: "&Database configuration file"; GroupDescription: "Open and manually review configuration files:"; Components: ezCloudServer
Name: openConfigFileJwt_json; Description: "JWT configuration file"; GroupDescription: "Open and manually review configuration files:"; Components: ezCloudServer; Flags: unchecked
Name: openConfigFileSecure_json; Description: "AES configuration file"; GroupDescription: "Open and manually review configuration files:"; Components: ezCloudServer; Flags: unchecked
Name: openConfigFileHttps_cert; Description: "HTTPS Certificate file"; GroupDescription: "Open and manually review configuration files:"; Components: ezCloudServer; Flags: unchecked
Name: openConfigFileHttps_key; Description: "HTTPS RSA Private Key file"; GroupDescription: "Open and manually review configuration files:"; Components: ezCloudServer; Flags: unchecked
Name: openConfigFileHttps_key_tmp; Description: "HTTPS Encrypted Key file"; GroupDescription: "Open and manually review configuration files:"; Components: ezCloudServer; Flags: unchecked

[Files]
Source: "{#DistSubDirectory}\bin\*"; DestDir: "{app}\bin"; Components: ezCloudServer
Source: "{#DistSubDirectory}\config\*"; DestDir: "{app}\config"; Components: ezCloudServer
Source: "{#DistSubDirectory}\config.sample\*"; DestDir: "{app}\config.sample"; Components: ezCloudServer
Source: "{#DistSubDirectory}\database\*"; DestDir: "{app}\database"; Components: ezCloudServer
Source: "{#DistSubDirectory}\.env"; DestDir: "{app}"; Components: ezCloudServer
Source: "{#DistSubDirectory}\.env.sample"; DestDir: "{app}"; Components: ezCloudServer
Source: "{#DistSubDirectory}\public_web_root\*"; DestDir: "{app}\public_web_root"; Components: ezCloudFrontend; Flags: recursesubdirs

[Dirs]
Name: "{app}\public_web_root"; Components: ezCloudServer

[Icons]
Name: "{group}\Open Configuration Folder"; Filename: "{app}\config"
Name: "{group}\Open Configuration Sample Folder"; Filename: "{app}\config.sample"
Name: "{group}\Open Configuration Sample Folder"; Filename: "{app}\config.sample"
Name: "{group}\Access Source Code on GitHub"; Filename: "https://github.com/TonyMasse/EZ-Cloud/"
Name: "{group}\Uninstall EZ Cloud Server"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\config\database.json"; Description: "View the Database configuration file"; Tasks: openConfigFileDatabase_json; Flags: shellexec skipifsilent
Filename: "{app}\config\jwt.json"; Description: "View the JWT configuration file"; Tasks: openConfigFileJwt_json; Flags: shellexec skipifsilent
Filename: "{app}\config\secure.json"; Description: "View the AES configuration file"; Tasks: openConfigFileSecure_json; Flags: shellexec skipifsilent
Filename: "{app}\config\https.cert.pem"; Description: "View the HTTPS Certificate file"; Tasks: openConfigFileHttps_cert; Flags: shellexec skipifsilent
Filename: "{app}\config\https.key.pem"; Description: "View the HTTP RSA Key file"; Tasks: openConfigFileHttps_key; Flags: shellexec skipifsilent
Filename: "{app}\config\https.keytmp.pem"; Description: "View the HTTP Private Key file"; Tasks: openConfigFileHttps_key_tmp; Flags: shellexec skipifsilent
; all the other tasks...