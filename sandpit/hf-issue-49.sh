# =============================================
# Author:		Tony Massé
# Create date: 2023-06-14
# Modifed on: 2023-07-31 - To point URL to "main" branch
# =====
# Description:
# This script will run the stored procedure
# that contains the hotfix for issue #49
# https://github.com/logrhythm/EZ-Cloud/issues/49
# =============================================

cd /tmp
wget https://raw.githubusercontent.com/logrhythm/EZ-Cloud/main/database/pgsql/20220613.08%20-%20Create%20Stored%20Procedure%20-%20upsert_openCollector.sql
cat "20220613.08 - Create Stored Procedure - upsert_openCollector.sql" | docker exec -i oc-db psql --username=postgres --dbname oc-admin
