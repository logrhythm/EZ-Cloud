@echo off
echo.
echo  OC Admin Server (Formerly "EZ Cloud Server") - OC Admin "ocAdmin" account creation script 
echo.
echo NOTE: This will attempt to create an EZ Admin account on the local MS SQL server.
echo.
echo NOTE: It will use the current user in SQL Trusted mode. If the current user doesn't have Admin access onto SQL, please re-run this script as a local Administrator or provide it and the .SQL files to your DBA.
echo.
echo.
echo If this was run by mistake, press [Ctrl] + [C] to abord now. Or:

if "%~1"=="--NoSleepTillBrooklyn" (goto NO_PAUSE_ONE)
pause
:NO_PAUSE_ONE

echo on

osql -E -n -i "20211111.17 - Create User - OcAdmin.sql"

@echo off
echo.
echo Job done. See above for any error message.

if "%~1"=="--NoSleepTillBrooklyn" (goto NO_PAUSE_TWO)
pause
:NO_PAUSE_TWO
