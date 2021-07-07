@echo off
echo " "
echo " EZ Cloud Server - Database creation script "
echo " "
echo "NOTE: This will attempt to create an EZ database on the local MS SQL server."
echo "If this was run by mistake, press [Ctrl] + [C] to abord now. Or:"

pause

echo on

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

echo " "
echo "Job done. See above for any error message."

@pause
