@echo off
echo Stopping Service...

NET STOP "EZ-Cloud Server"

echo Starting Service...

NET START "EZ-Cloud Server"

echo Done.
