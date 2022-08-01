@echo off
echo.
echo  OC Admin Server - Database creation and update script 
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
osql -E -n -d EZ -i "20210430.01 - Create Table - openCollectors.sql"
osql -E -n -d EZ -i "20210430.02 - Create Table - pipelines.sql"
osql -E -n -d EZ -i "20210430.03 - Create Table - states.sql"
osql -E -n -d EZ -i "20210430.04 - Create Table - logSamples.sql"
osql -E -n -d EZ -i "20210430.05 - Create Table - logSampleLogs.sql"
osql -E -n -d EZ -i "20210430.06 - Create Table - openCollectorsPipelines.sql"
osql -E -n -d EZ -i "20210510.07 - Create Stored Procedure - upsert_openCollector.sql"
osql -E -n -d EZ -i "20210512.08 - Create Function - fn_Get_State_Id.sql"
osql -E -n -d EZ -i "20210512.08 - Create Stored Procedure - upsert_pipeline.sql"
osql -E -n -d EZ -i "20210708.09 - Create Stored Procedure - upsert_LogSource_Type.sql"
osql -E -n -d EZ -i "20210708.10 - Create Stored Procedure - clone_MPE_Rule.sql"
osql -E -n -d EZ -i "20210709.11 - Create Stored Procedure - upsert_MPE_SubRule.sql"
osql -E -n -d EZ -i "20210712.12 - Create Stored Procedure - upsert_Processing_Policy.sql"
osql -E -n -d EZ -i "20210714.13 - Create Stored Procedure - upsert_Log_Source_Virtualisation_Template.sql"
osql -E -n -d EZ -i "20210715.14 - Create Stored Procedure - upsert_Log_Source_Virtualisation_Template_Item.sql"
osql -E -n -d EZ -i "20210719.15 - Create View - list_OpenCollector_Log_Sources.sql"
osql -E -n -d EZ -i "20210720.16 - Create Stored Procedure - upsert_Log_Source_Virtualisation_To_OpenCollector_LogSource.sql"
osql -E -n -d EZ -i "20211112.18 - Create Table - rbacRoles.sql"
osql -E -n -d EZ -i "20211112.19 - Create Table - rbacUserToRoles.sql"
osql -E -n -d EZ -i "20211122.20 - Create Stored Procedure - upsert_RBAC_User.sql"
osql -E -n -d EZ -i "20211122.21 - Create Stored Procedure - delete_RBAC_User.sql"
osql -E -n -d EZ -i "20211123.22 - Create Stored Procedure - upsert_RBAC_Role.sql"
osql -E -n -d EZ -i "20211123.23 - Create Stored Procedure - delete_RBAC_Role.sql"
osql -E -n -d EZ -i "20220209.24 - Create View - get_SIEM_Master_ID.sql"
osql -E -n -d EZ -i "20220803.25 - Create View - get_EZ_Versions.sql"

@echo off
echo.
echo Job done. See above for any error message.

if "%~1"=="--NoSleepTillBrooklyn" (goto NO_PAUSE_TWO)
pause
:NO_PAUSE_TWO
