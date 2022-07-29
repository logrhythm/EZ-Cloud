#define RepoURL 'https://github.com/logrhythm/EZ-Cloud'
#define NodeJsURL 'https://nodejs.org/dist/v14.17.6/node-v14.17.6-x64.msi'
#define NodeJsSHA 'e72ceb05c7596a6e381172369dce1c374a2b09ee739dca330be58f3977b5c03d'
#define NodeJsFilename 'node-v14.17.6-x64.msi'
#define NodeJsVersionLabel 'v14.17.6-x64'
#define ConfigFilesViewer 'Notepad.exe'

[Setup]
AppName=OC-Admin - Backend Server
AppVersion={#Version}
DefaultDirName={autopf}\OC Admin Server
DefaultGroupName=OC Admin - Server
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern
DisableWelcomePage=no
LicenseFile="{#DistSubDirectory}\License.txt"
; SignTool=MicrosoftSigningTool "{#InstallerHelper}\signtool.exe" sign /f "{#InstallerHelper}\Installer_Wizard_Code_Signing_Certificate.crt" /tr http://timestamp.sectigo.com /td sha256 /fd sha256 /a $p

[Types]
Name: "full"; Description: "Full installation (OC Admin Server + EZ Database + Frontend + NodeJS)"
Name: "lrCloud"; Description: "LR Cloud installation (OC Admin Server + EZ Database + NodeJS)"
Name: "compact"; Description: "Compact installation (OC Admin Server + EZ Database + Frontend)"
Name: "minimal"; Description: "Minimal installation (OC Admin Server + EZ Database)"
Name: "sqlonly"; Description: "Only SQL Database and configuration (EZ Database)"
; Name: "upgrade"; Description: "Full upgrade to {#Version} (OC Admin Server + Frontend)"
; Name: "upgradeBackend"; Description: "Backend upgrade to {#Version} (OC Admin Server)"
; Name: "upgradeFrontend"; Description: "Frontend upgrade to {#Version} (OC Admin Frontend)"
Name: "custom"; Description: "Custom installation / upgrade"; Flags: iscustom

[Components]
Name: "ocAdminServer"; Description: "OC Admin Server"; Types: full lrCloud compact minimal custom
Name: "sqlDatabase"; Description: "EZ Database and SQL User"; Types: full lrCloud compact minimal sqlonly custom
Name: "ocAdminFrontend"; Description: "OC Admin Frontend"; Types: full compact custom
Name: "nodeJs"; Description: "NodeJS"; Types: full lrCloud custom; ExtraDiskSpaceRequired: 56700928
; NodeJS:
; Installed - Installer = extra disk requered (all sizes in Bytes)
; 87236608 - 30535680 = 56700928
; Name: "ocAdminUpgradeServer"; Description: "Upgrade OC Admin Server to {#Version}"; Types: upgrade upgradeBackend custom
; Name: "ocAdminUpgradeFrontend"; Description: "Upgrade OC Admin Frontend to {#Version}"; Types: upgrade upgradeFrontend custom

[Tasks]
Name: createDatabase; Description: "Create / Update and Configure [EZ] SQL Database"; GroupDescription: "Database:"; Components: sqlDatabase
Name: installNodeJs; Description: "Install NodeJS {#NodeJsVersionLabel} (>>> Can take up to 2 minutes to install in the background)"; GroupDescription: "NodeJS:"; Components: nodeJs
Name: serviceSetup; Description: "Configure OC Admin Service"; GroupDescription: "Service:"; Components: ocAdminServer
Name: serviceStart; Description: "Start OC Admin Service immediately"; GroupDescription: "Service:"; Components: ocAdminServer
Name: autoGenerateTokens; Description: "Automatically &generate private tokens"; GroupDescription: "Private tokens:"; Components: ocAdminServer
Name: autoGenerateTokens\jwt; Description: "For &JWT (Authentication token encryption/decripion key)"; GroupDescription: "Private tokens:"; Components: ocAdminServer
Name: autoGenerateTokens\aes; Description: "For &AES (Encryption / Decryption private key)"; GroupDescription: "Private tokens:"; Components: ocAdminServer
Name: openConfigFileDatabase_json; Description: "&Database configuration file"; GroupDescription: "Open and manually review configuration files:"; Components: ocAdminServer; Flags: unchecked
Name: openConfigFileJwt_json; Description: "JWT configuration file"; GroupDescription: "Open and manually review configuration files:"; Components: ocAdminServer; Flags: unchecked
Name: openConfigFileSecure_json; Description: "AES configuration file"; GroupDescription: "Open and manually review configuration files:"; Components: ocAdminServer; Flags: unchecked
Name: openConfigFileHttps_cert; Description: "HTTPS Certificate file"; GroupDescription: "Open and manually review configuration files:"; Components: ocAdminServer; Flags: unchecked
Name: openConfigFileHttps_key; Description: "HTTPS RSA Private Key file"; GroupDescription: "Open and manually review configuration files:"; Components: ocAdminServer; Flags: unchecked
Name: openConfigFileHttps_key_tmp; Description: "HTTPS Encrypted Key file"; GroupDescription: "Open and manually review configuration files:"; Components: ocAdminServer; Flags: unchecked

[Files]
Source: "{#DistSubDirectory}\bin\*"; DestDir: "{app}\bin"; Components: ocAdminServer; AfterInstall: FileReplaceTokenByConstant('{app}\bin\ocadminserver.xml', 'ROOT_PATH_OC-Admin', '{app}')
Source: "{#DistSubDirectory}\config\database.json"; DestDir: "{app}\config"; Components: ocAdminServer; AfterInstall: FileReplaceSqlCreds('{app}\config\database.json'); Flags: onlyifdoesntexist
Source: "{#DistSubDirectory}\config\ez-market-place.json"; DestDir: "{app}\config"; Components: ocAdminServer; AfterInstall: FileReplaceTokenByV4Uuid('{app}\config\ez-market-place.json', 'CHANGE_ME_WITH_A_UUID'); Flags: onlyifdoesntexist
Source: "{#DistSubDirectory}\config\jwt.json"; DestDir: "{app}\config"; Components: ocAdminServer; AfterInstall: FileReplaceTokenIfTaskSelected('{app}\config\jwt.json', 'CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS', 50, 'autoGenerateTokens\jwt'); Flags: onlyifdoesntexist
Source: "{#DistSubDirectory}\config\secure.json"; DestDir: "{app}\config"; Components: ocAdminServer; AfterInstall: FileReplaceTokenIfTaskSelected('{app}\config\secure.json', 'CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS', 120, 'autoGenerateTokens\aes'); Flags: onlyifdoesntexist
Source: "{#DistSubDirectory}\config\https.*"; DestDir: "{app}\config"; Components: ocAdminServer; Flags: onlyifdoesntexist
Source: "{#DistSubDirectory}\config.sample\*"; DestDir: "{app}\config.sample"; Components: ocAdminServer
Source: "{#DistSubDirectory}\database\*"; DestDir: "{app}\database"; Components: sqlDatabase
Source: "{#DistSubDirectory}\resources\*"; DestDir: "{app}\resources"; Components: ocAdminServer
Source: "{#DistSubDirectory}\.env"; DestDir: "{app}"; Components: ocAdminServer; Flags: onlyifdoesntexist
Source: "{#DistSubDirectory}\.env.sample"; DestDir: "{app}"; Components: ocAdminServer
Source: "{#DistSubDirectory}\public_web_root\*"; DestDir: "{app}\public_web_root"; Components: ocAdminFrontend; Flags: recursesubdirs
; For NodeJS Installation
Source: "{#distDirectory}\NodeJS_Installer\{#NodeJsFilename}"; DestDir: "{tmp}"; Components: nodeJs
; For OcAdmin account creation
Source: "{#DistSubDirectory}\database\20211111.17 - Create User - OcAdmin.sql"; DestDir: "{tmp}"; Components: sqlDatabase; AfterInstall: FileReplaceOcAdminCreds('{tmp}\20211111.17 - Create User - OcAdmin.sql')
Source: "{#DistSubDirectory}\database\create_ocadmin.bat"; DestDir: "{tmp}"; Components: sqlDatabase

[Dirs]
Name: "{app}\public_web_root"; Components: ocAdminServer

[Icons]
Name: "{group}\Open Configuration Folder"; Filename: "{app}\config"
Name: "{group}\Open Configuration Sample Folder"; Filename: "{app}\config.sample"
Name: "{group}\Access Source Code on GitHub"; Filename: "https://github.com/logrhythm/EZ-Cloud/"
Name: "{group}\Uninstall OC Admin Server"; Filename: "{uninstallexe}"

[Run]
Filename: "{app}\database\create_database.bat"; Parameters: "--NoSleepTillBrooklyn"; WorkingDir: "{app}\database"; Description: "Create and Configure [EZ] SQL Database"; Tasks: createDatabase
Filename: "{tmp}\create_ocadmin.bat"; Parameters: "--NoSleepTillBrooklyn"; WorkingDir: "{tmp}"; Description: "Create and Configure OcAdmin account in SQL Database"; Tasks: createDatabase; Flags: runhidden
; Filename: "MsiExec.exe"; Parameters: "/i ""{tmp}\{#NodeJsFilename}"" /qn"; Description: "Installing NodeJS {#NodeJsVersionLabel}"; Tasks: installNodeJs; Flags: runhidden skipifnotsilent
; Filename: "MsiExec.exe"; Parameters: "/i ""{tmp}\{#NodeJsFilename}"""; Description: "Installing NodeJS {#NodeJsVersionLabel}"; Tasks: installNodeJs; Flags: skipifsilent
Filename: "MsiExec.exe"; Parameters: "/i ""{tmp}\{#NodeJsFilename}"" /qn"; Description: "Installing NodeJS {#NodeJsVersionLabel}"; Tasks: installNodeJs; Flags: skipifsilent
Filename: "{app}\bin\ocadminserver.exe"; Parameters: "install"; WorkingDir: "{app}\bin"; Description: "Setting up the OC Admin service"; Tasks: serviceSetup; Flags: runhidden
Filename: "{app}\bin\ocadminserver.exe"; Parameters: "start"; WorkingDir: "{app}\bin"; Description: "Starting the OC Admin service"; Tasks: serviceStart; Flags: runhidden skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\database.json"; Description: "View the Database configuration file"; Tasks: openConfigFileDatabase_json; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\jwt.json"; Description: "View the JWT configuration file"; Tasks: openConfigFileJwt_json; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\secure.json"; Description: "View the AES configuration file"; Tasks: openConfigFileSecure_json; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\https.cert.pem"; Description: "View the HTTPS Certificate file"; Tasks: openConfigFileHttps_cert; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\https.key.pem"; Description: "View the HTTP RSA Key file"; Tasks: openConfigFileHttps_key; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\https.keytmp.pem"; Description: "View the HTTP Private Key file"; Tasks: openConfigFileHttps_key_tmp; Flags: nowait skipifsilent

[UninstallRun]
Filename: "{app}\bin\ocadminserver.exe"; Parameters: "stop"; WorkingDir: "{app}\bin"; Flags: runhidden
Filename: "{app}\bin\ocadminserver.exe"; Parameters: "uninstall"; WorkingDir: "{app}\bin"; Flags: runhidden

[UninstallDelete]
Type: files; Name: "{app}\bin\ocadminserver.wrapper.log"

; Set by parameters (for Silent, or not):
; - SQL details (creds)
; - JWT token
; - AES token
; - HTTPS certs and keys
; - Start of Service

[Code]
const
wcpOcAdminCredentialsQueryPage = 100;
wcpSqlCredentialsQueryPage = 101;

var
  SqlCredentialsQueryPage: TInputQueryWizardPage;
  SqlCredentialsLogin: String;
  SqlCredentialsPassword: String;
  SqlCredentialsHost: String;
  SqlCredentialsPort: String;
  OcAdminCredentialsQueryPage: TInputQueryWizardPage;
  OcAdminCredentialsPassword: String;

procedure URLLabelOnClick(Sender: TObject);
var
  ErrorCode: Integer;
begin
  ShellExecAsOriginalUser('open', '{#RepoURL}', '', '', SW_SHOWNORMAL, ewNoWait, ErrorCode);
end;

procedure CreateURLLabel(ParentForm: TSetupForm; CancelButton: TNewButton);
var
  URLLabel: TNewStaticText;
begin
  URLLabel := TNewStaticText.Create(ParentForm);
  URLLabel.Caption := '{#RepoURL}';
  URLLabel.Cursor := crHand;
  URLLabel.OnClick := @URLLabelOnClick;
  URLLabel.Parent := ParentForm;
  { Alter Font *after* setting Parent so the correct defaults are inherited first }
  URLLabel.Font.Style := URLLabel.Font.Style + [fsUnderline];
  URLLabel.Font.Color := clHotLight
  URLLabel.Top := CancelButton.Top + (CancelButton.Height - URLLabel.Height) / 2;
  URLLabel.Left := ParentForm.ClientWidth - CancelButton.Left - CancelButton.Width;
  URLLabel.Anchors := [akLeft, akBottom];
end;

procedure AddSqlCredentialsQueryPage();
begin
  if SqlCredentialsQueryPage = nil then
    begin
      SqlCredentialsQueryPage := CreateInputQueryPage(
        wpSelectProgramGroup,
        'SQL Credentials and Details',
        'At run time, OC Admin requires valid SQL Credentials to manage the its own and the SIEM databases.',
        'NOTE:' + #10+#13 + 'These credentials are for run time only. This Installation Wizard will use the user currently running it to create the EZ database.' + #10+#13 + #10+#13 +
        'IMPORTANT:' + #10+#13 + 'The credentials must have READ and WRITE access to the EZ and LogRhythm_EMDB databases.' + #10+#13);

      SqlCredentialsQueryPage.Add('SQL User Name:', False);
      SqlCredentialsQueryPage.Add('SQL Password:', True);
      SqlCredentialsQueryPage.Add('SQL Host:', False);
      SqlCredentialsQueryPage.Add('SQL Port:', False);

      SqlCredentialsQueryPage.Values[0] := 'sa';
      SqlCredentialsQueryPage.Values[1] := '';
      SqlCredentialsQueryPage.Values[2] := 'localhost';
      SqlCredentialsQueryPage.Values[3] := '1433';
    end
end;

procedure AddOcAdminCredentialsQueryPage();
begin
  if OcAdminCredentialsQueryPage = nil then
    begin
      OcAdminCredentialsQueryPage := CreateInputQueryPage(
        wpSelectProgramGroup,
        'OC Admin Administrator Credentials and Details - ocAdmin',
        'This is the OC Admin account for OC Admin.',
        'NOTE:' + #10+#13 + ' - The Username is NOT case sensitive' + #10+#13 +
        ' - The Password IS case sensitive.' + #10+#13 +
        ' - If the "ocAdmin" SQL Login already exists (in case of Upgrade for example), it will NOT be modified.' + #10+#13 + #10+#13 + #10+#13 +
        'Username:' + #10+#13 + 'ocAdmin');

      OcAdminCredentialsQueryPage.Add('Password:', True);

      OcAdminCredentialsQueryPage.Values[0] := '';
    end;
end;

procedure InitializeWizard();
begin
  CreateURLLabel(WizardForm, WizardForm.CancelButton);
  AddOcAdminCredentialsQueryPage();
  AddSqlCredentialsQueryPage();
end;

procedure InitializeUninstallProgressForm();
begin
  CreateURLLabel(UninstallProgressForm, UninstallProgressForm.CancelButton);
end;

// To replace the tokens and creds in config files

function FileReplaceString(const FileName, SearchString, ReplaceString: string) : boolean;
var
  MyFile : TStrings;
  MyText : string;
begin
  MyFile := TStringList.Create;
  try
    result := true;
    try
      MyFile.LoadFromFile(FileName);
      MyText := MyFile.Text;

      { Only save if text has been changed. }
      if StringChangeEx(MyText, SearchString, ReplaceString, True) > 0 then
      begin;
        MyFile.Text := MyText;
        MyFile.SaveToFile(FileName);
      end;
    except
      result := false;
    end;
  finally
    MyFile.Free;
  end;
end;

// To generate secure tokens and private keys

function GetRandomString(const CharCount: Integer): String;
var
    I: Integer;
    RandomInt: Integer;
    RandomString: String;
begin
    RandomString := '';
    for I := 1 to CharCount do
    begin
        // Get a random number in the following ranges: (35..91) + (97..126)
        // This is to avoid characters that would cause issues in the JSON file
        RandomInt := Random(57+30) + 35;
        if (RandomInt > 91) and (RandomInt < 97) then
            RandomInt := RandomInt + 5;

        // Transform this number into a Char and add it to the RandomString
        RandomString := RandomString + Chr(RandomInt);
    end;
    Result := RandomString;
end;

// To generate a Version 4 UUID

function GetVersion4UuidString(): String;
var
    RandomString: String;
    RandomIntA: Integer;
    RandomIntB: Integer;
    RandomIntC: Integer;
    RandomIntD: Integer;
    RandomIntEa: Integer;
    RandomIntEb: Integer;
    RandomIntF: Integer;
    RandomIntG: Integer;
    RandomIntH: Integer;
begin
    // Outputing a UUID in the format: 123e4567-e89b-12d3-a456-426655440000
    RandomIntA := Random(65536);
    RandomIntB := Random(65536);
    // -
    RandomIntC := Random(65536);
    // -
    // Value 4
    RandomIntD := Random(4096);
    // -
    RandomIntEa := Random(4) + 8; // Values between 8 and 11
    RandomIntEb := Random(4096);
    // -
    RandomIntF := Random(65536);
    RandomIntG := Random(65536);
    RandomIntH := Random(65536);
    RandomString := Lowercase(
      Format('%.4x%.4x-%.4x-4%.3x-%.1x%.3x-%.4x%.4x%.4x', [RandomIntA, RandomIntB, RandomIntC, RandomIntD, RandomIntEa, RandomIntEb, RandomIntF, RandomIntG, RandomIntH])
    );
    Result := RandomString;
end;

// To replace the token in a given file, by an exanded Constant

procedure FileReplaceTokenByConstant(const FileName, SearchString, ReplaceString: string);
begin
    FileReplaceString(ExpandConstant(FileName), SearchString, ExpandConstant(ReplaceString));
end;

// To replace the token in a given file, by a generated random string

procedure FileReplaceToken(const FileName, SearchString: string ; const CharCount: Integer);
begin
    FileReplaceString(ExpandConstant(FileName), SearchString, GetRandomString(CharCount));
end;

// To replace the token in a given file, by a generated random v4 UUID

procedure FileReplaceTokenByV4Uuid(const FileName, SearchString: string);
begin
    FileReplaceString(ExpandConstant(FileName), SearchString, GetVersion4UuidString());
end;

// To replace the SQL Credentials by the ones provided in the Wizard

procedure FileReplaceSqlCreds(const FileName: String);
begin
    FileReplaceString(ExpandConstant(FileName), '"userName":"sa"', '"userName":"' + SqlCredentialsLogin + '"');
    FileReplaceString(ExpandConstant(FileName), '"password":"CHANGE_ME"', '"password":"' + SqlCredentialsPassword + '"');
    FileReplaceString(ExpandConstant(FileName), '"server":"localhost"', '"server":"' + SqlCredentialsHost + '"');
    FileReplaceString(ExpandConstant(FileName), '"port": 1433', '"port": ' + SqlCredentialsPort);
end;

// To replace the OcAdmin password by the ones provided in the Wizard
// NOTE: This should only be used against a temporary file, as you do not want to leave
// the OcAdmin password left in a file after the installation

procedure FileReplaceOcAdminCreds(const FileName: String);
var
  EscapedOcAdminCredentialsPassword : string;
begin
    // Escaping the password for SQL consumption
    EscapedOcAdminCredentialsPassword := OcAdminCredentialsPassword
    StringChangeEx(EscapedOcAdminCredentialsPassword, '''', '''''', True)
    FileReplaceString(ExpandConstant(FileName), 'CHANGE_ME', EscapedOcAdminCredentialsPassword);
end;

// To replace the token in a given file, by a generated random string, only if the mathcing Task is selected

procedure FileReplaceTokenIfTaskSelected(const FileName, SearchString: string ; const CharCount: Integer ; const TaskSelected: string);
begin
    if WizardIsTaskSelected(TaskSelected) then
    begin
        FileReplaceToken(FileName, SearchString, CharCount);
    end;
end;

procedure CurStepChanged(CurStep: TSetupStep);
begin
  if CurStep = ssInstall then
  begin
    { Collect the entered SQL Credentials into the relevant variables}
    SqlCredentialsLogin    := SqlCredentialsQueryPage.Values[0];
    SqlCredentialsPassword := SqlCredentialsQueryPage.Values[1];
    SqlCredentialsHost     := SqlCredentialsQueryPage.Values[2];
    SqlCredentialsPort     := SqlCredentialsQueryPage.Values[3];

    { Collect the entered OCAdmin Credentials into the relevant variables}
    OcAdminCredentialsPassword := OcAdminCredentialsQueryPage.Values[0];
  end;
end;

function ShouldSkipPage(PageID: Integer): Boolean;
begin
  Result := False;

  // // Skip the OcAdmin Credential Page if Component neither ocAdminServer nor ocAdminUpgradeServer is selected
  // if (PageID = wcpOcAdminCredentialsQueryPage) and not WizardIsComponentSelected('ocAdminServer ocAdminUpgradeServer') then
  //   Result := True;
  // Skip the OcAdmin Credential Page if Component sqlDatabase is not selected
  if (PageID = wcpOcAdminCredentialsQueryPage) and not WizardIsComponentSelected('sqlDatabase') then
    Result := True;

  // Skip the SQL Credential Page if Component ocAdminServer is not selected
  if (PageID = wcpSqlCredentialsQueryPage) and not WizardIsComponentSelected('ocAdminServer') then
    Result := True;
end;
