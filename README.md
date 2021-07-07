[![Last Release](https://badgen.net/badge/release/v0.6.0/green)](https://github.com/TonyMasse/EZ-Cloud/releases)
[![Dev Version](https://badgen.net/badge/dev/v0.6.x/orange)](https://github.com/TonyMasse/EZ-Cloud/tree/v0.6.0)

# EZ-Cloud
 EZ-Cloud for Legacy SIEM

Check [Releases](https://github.com/TonyMasse/EZ-Cloud/releases) for version specific instructions.

# Backend:

## Requirements
- NodeJS (v12.16 or above)
- MS SQL (v2012 or above)

## Setup
As per v0.5.

### Microsoft Windows

#### 1. Prepare SQL Database
Assuming you are running these commands on the SQL itself (typically your XM or PM), and that you are logged as an Administrator.
If not, please adapt the commands below to match your situation.

```batch
cd database
osql -E -i "20210430.00 - Create DB.sql"
osql -E -d EZ -i "20210430.01 - Create Table - openCollectors.sql"
osql -E -d EZ -i "20210430.02 - Create Table - pipelines.sql"
osql -E -d EZ -i "20210430.03 - Create Table - states.sql"
osql -E -d EZ -i "20210430.04 - Create Table - logSamples.sql"
osql -E -d EZ -i "20210430.05 - Create Table - logSampleLogs.sql"
osql -E -d EZ -i "20210430.06 - Create Table - openCollectorsPipelines.sql"
osql -E -d EZ -i "20210510.07 - Create Stored Procedure - upsert_openCollector.sql"
osql -E -d EZ -i "20210512.08 - Create Function - fn_Get_State_Id.sql"
osql -E -d EZ -i "20210512.08 - Create Stored Procedure - upsert_pipeline.sql"
```

#### 2. Prepare NPM modules
```batch
npm install
npm install -g node-windows
```

#### 3. Create your configuration
- copy the files from `/config.sample/` to `/config/`
- update accordingly
- copy `/.env.sample` to `/.env`
- update accordingly

#### 4. Run it straight from the command prompt, like it's 1992
```batch
npm start
```

#### 5. Install and run as a Service
:boom: __*(Experimental)*__ :boom:

```batch
rpm run installService
net start "EZ-Cloud Server"
netsh advfirewall firewall add rule name="EZ-Cloud - Backend server (TCP/8400)" dir=in action=allow protocol=TCP localport=8400
```

## Know issues :bug: :beetle:
- Hard coded to use the SSH details stored in `/src/config/ssh.json` when running __Tail__
  - This is meant to be fixed asap (v.0.5.0-rc2) and will eventually use the details of the Primary Collector specified in the Pipeline details
- `Syslog` Collection produced configuration file doesn't work as is
  - That's because Filebeat doesn't accept to have both UDP and TCP set up in the same `input`
  - Quick fix for now: once the config is created, simply delete the line about either TCP or UDP
  - Coming fix (v.0.5.0-rc2): eventually have two distinct `Syslog` Collection Methods:
    - `Syslog - TCP`
    - `Syslog - UDP`

## Report a bug or issue
- Use the [Issues](https://github.com/TonyMasse/EZ-Cloud/issues) on GitHub

## Development

### Coding

```
npm run dev
```

### Lint

```
npm run lint
```

### Test

```
npm run test
```

# Frontend:
## Setup

```
cd frontend
npm install
```

## Development

### Coding

```
cd frontend
quasar dev --modern
```
