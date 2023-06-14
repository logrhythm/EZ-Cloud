# =============================================
# Author:		Tony Massé
# Create date: 2023-06-14
# =====
# Description:
# This script will run the stored procedure
# that contains the hotfix for issue #49
# https://github.com/logrhythm/EZ-Cloud/issues/49
# =============================================

cd /tmp
wget https://raw.githubusercontent.com/OpenCollector/open-collector/v1.2/20220613.08%20-%20Create%20Stored%20Procedure%20-%20upsert_openCollector.sql
cat "20220613.08 - Create Stored Procedure - upsert_openCollector.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
