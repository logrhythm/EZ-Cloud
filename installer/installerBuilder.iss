#define RepoURL 'https://github.com/TonyMasse/EZ-Cloud'
#define NodeJsURL 'https://nodejs.org/dist/v14.17.6/node-v14.17.6-x64.msi'
#define NodeJsSHA 'e72ceb05c7596a6e381172369dce1c374a2b09ee739dca330be58f3977b5c03d'
#define NodeJsVersionLabel 'v14.17.6-x64'
#define ConfigFilesViewer 'Notepad.exe'

[Setup]
AppName=EZ-Cloud - Backend Server
AppVersion={#Version}
DefaultDirName={autopf}\EZ Cloud Server
DefaultGroupName=EZ Cloud - Server
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
WizardStyle=modern

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
Source: "{#DistSubDirectory}\config\database.json"; DestDir: "{app}\config"; Components: ezCloudServer
Source: "{#DistSubDirectory}\config\jwt.json"; DestDir: "{app}\config"; Components: ezCloudServer; AfterInstall: FileReplaceTokenIfTaskSelected('{app}\config\jwt.json', 'CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS', 50, 'autoGenerateTokens\jwt')
Source: "{#DistSubDirectory}\config\secure.json"; DestDir: "{app}\config"; Components: ezCloudServer; AfterInstall: FileReplaceTokenIfTaskSelected('{app}\config\secure.json', 'CHANGE_ME_WITH_A_SUPER_LONG_STRING_OF_RANDOM_CHARACTERS', 120, 'autoGenerateTokens\aes')
Source: "{#DistSubDirectory}\config\https.*"; DestDir: "{app}\config"; Components: ezCloudServer
Source: "{#DistSubDirectory}\config.sample\*"; DestDir: "{app}\config.sample"; Components: ezCloudServer
Source: "{#DistSubDirectory}\database\*"; DestDir: "{app}\database"; Components: ezCloudServer
Source: "{#DistSubDirectory}\.env"; DestDir: "{app}"; Components: ezCloudServer
Source: "{#DistSubDirectory}\.env.sample"; DestDir: "{app}"; Components: ezCloudServer
Source: "{#DistSubDirectory}\public_web_root\*"; DestDir: "{app}\public_web_root"; Components: ezCloudFrontend; Flags: recursesubdirs
; NodeJS

[Dirs]
Name: "{app}\public_web_root"; Components: ezCloudServer

[Icons]
Name: "{group}\Open Configuration Folder"; Filename: "{app}\config"
Name: "{group}\Open Configuration Sample Folder"; Filename: "{app}\config.sample"
Name: "{group}\Access Source Code on GitHub"; Filename: "https://github.com/TonyMasse/EZ-Cloud/"
Name: "{group}\Uninstall EZ Cloud Server"; Filename: "{uninstallexe}"

[Run]
; READY, JUST DISABLED DURING TESTING --- Filename: "{app}\database\create_database.bat"; WorkingDir: "{app}\database"; Description: "Create and Configure [EZ] SQL Database"; Tasks: createDatabase;
Filename: "{app}\database\create_database.bat"; Parameters: "--NoStoppingTillBrooklyn"; WorkingDir: "{app}\database"; Description: "Create and Configure [EZ] SQL Database"; Tasks: createDatabase
; Filename: "PowerShell.exe"; Parameters: "-Command "; Description: "Setting up the EZ Server service"; Tasks: serviceSetup;
Filename: {sys}\sc.exe; Parameters: "start ""EZ-Cloud Server"""; Description: "Starting EZ Server service"; Tasks: serviceStart; Flags: runhidden skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\database.json"; Description: "View the Database configuration file"; Tasks: openConfigFileDatabase_json; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\jwt.json"; Description: "View the JWT configuration file"; Tasks: openConfigFileJwt_json; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\secure.json"; Description: "View the AES configuration file"; Tasks: openConfigFileSecure_json; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\https.cert.pem"; Description: "View the HTTPS Certificate file"; Tasks: openConfigFileHttps_cert; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\https.key.pem"; Description: "View the HTTP RSA Key file"; Tasks: openConfigFileHttps_key; Flags: nowait skipifsilent
Filename: "{#ConfigFilesViewer}"; Parameters: "{app}\config\https.keytmp.pem"; Description: "View the HTTP Private Key file"; Tasks: openConfigFileHttps_key_tmp; Flags: nowait skipifsilent

[UninstallRun]
Filename: {sys}\sc.exe; Parameters: "stop ""EZ-Cloud Server""" ; Flags: runhidden
Filename: {sys}\sc.exe; Parameters: "delete ""EZ-Cloud Server""" ; Flags: runhidden

; Set by parameters (for Silent, or not):
; - SQL details (creds)
; - JWT token
; - AES token
; - HTTPS certs and keys
; - Start of Service

[Code]
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

procedure InitializeWizard();
begin
  CreateURLLabel(WizardForm, WizardForm.CancelButton);
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

// To replace the token in a given file, by a generated random string

procedure FileReplaceToken(const FileName, SearchString: string ; const CharCount: Integer);
begin
    FileReplaceString(ExpandConstant(FileName), SearchString, GetRandomString(CharCount));
end;

// To replace the token in a given file, by a generated random string, only if the mathcing Task is selected

procedure FileReplaceTokenIfTaskSelected(const FileName, SearchString: string ; const CharCount: Integer ; const TaskSelected: string);
begin
    if WizardIsTaskSelected(TaskSelected) then
    begin
        FileReplaceToken(FileName, SearchString, CharCount);
    end;
end;

