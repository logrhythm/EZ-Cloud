@echo off
echo.
echo  OC Admin Server - Database creation and update script - For Docker deployments only
echo.
echo NOTE: This will attempt to create or update the EZ database on the local MS SQL server. It is SAFE to run this script multiple times.
echo.
echo NOTE: It will use the current user in SQL Trusted mode. If the current user doesn't have Admin access onto SQL, please re-run this script as a local Administrator or provide it and the .SQL files to your DBA.
echo.
echo.
echo If this was run by mistake, press [Ctrl] + [C] to abord now. Or:

if "%~1"=="--NoSleepTillBrooklyn" (goto NO_PAUSE_ONE)
pause
:NO_PAUSE_ONE

echo on

osql -E -n -i "20210430.00 - Create DB.sql"
osql -E -n -d EZ -i "20210708.09 - Create Stored Procedure - upsert_LogSource_Type.sql"
osql -E -n -d EZ -i "20210708.10 - Create Stored Procedure - clone_MPE_Rule.sql"
osql -E -n -d EZ -i "20210709.11 - Create Stored Procedure - upsert_MPE_SubRule.sql"
osql -E -n -d EZ -i "20210712.12 - Create Stored Procedure - upsert_Processing_Policy.sql"
osql -E -n -d EZ -i "20210714.13 - Create Stored Procedure - upsert_Log_Source_Virtualisation_Template.sql"
osql -E -n -d EZ -i "20210715.14 - Create Stored Procedure - upsert_Log_Source_Virtualisation_Template_Item.sql"
osql -E -n -d EZ -i "20210719.15 - Create View - list_OpenCollector_Log_Sources.sql"
osql -E -n -d EZ -i "20210720.16 - Create Stored Procedure - upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource.sql"
osql -E -n -d EZ -i "20220803.25 - Create View - get_EZ_Versions.sql"
osql -E -n -d EZ -Q "SELECT * FROM get_EZ_Versions;"

@echo off
echo.
echo Job done. See above for any error message.

if "%~1"=="--NoSleepTillBrooklyn" (goto NO_PAUSE_TWO)
pause
:NO_PAUSE_TWO
