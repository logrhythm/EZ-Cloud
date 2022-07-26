#!/usr/bin/env sh

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-26
# Modified on: 2022-07-27 - To remove dependency to Git, and avoid downloading the whole GitHub Repo
# Description: Pseudo LRCTL command. To deploy `oc-admin`, `oc-db` and ancilaries
#              Put the `ocAdmin` password in the environment variable `OC_ADMIN_PASSWORD`.
#              If `OC_ADMIN_PASSWORD` env. variable isn't already set to a password of at
#              Least 6 characters long, the user will be prompted for a new one.
# =============================================

GITHUB_REPO_URL_BASE="https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9"
DB_CREATION_SCRIPT="create_database.sh"

echo "### DOWNLOAD AND RUN \`oc-db\` START-UP SCRIPT..."
curl -fsSL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-db/_docker.run-oc-db.sh | sh

echo "### SLEEPING 5 SECONDS TO GIVE \`oc-db\` A CHANCE TO START-UP..."
sleep 5

echo ""
echo "Please provide a password for the default user is ocAdmin."
echo "Or press [CTRL]+[C] to abandon."
echo ""
echo "Rules:"
echo " - Mix of lowercase, uppercase, number and signs/non-alphanumerical characters"

# Prompt for pass if `OC_ADMIN_PASSWORD` isn't already set with at least a 6 character long password
# And keep looping until a 6+ character long password is provided, or user press CTRL+C
until [ ${#OC_ADMIN_PASSWORD} -gt 6 ]
do
  echo " - Password must have a minimum of 6 characters"
  echo ""
  read -sp 'Password: ' OC_ADMIN_PASSWORD </dev/tty
  echo ""
  echo ""
done

# Create a clean folder
echo "### CREATING A CLEAN DIRECTORY (\`./pgsql\`)..."
mkdir pgsql 2> /dev/null
# Clean up
rm -f pgsql/create_database.sh 2> /dev/null
rm -f pgsql/*.sql 2> /dev/null

echo "### WALK IN \`./pgsql\` DIRECTORY..."
cd pgsql

# Get the DB creation files
echo "### DOWNLOADING \"$GITHUB_REPO_URL_BASE/database/pgsql/$DB_CREATION_SCRIPT\"..."
curl -sSOL "$GITHUB_REPO_URL_BASE/database/pgsql/$DB_CREATION_SCRIPT"

echo "### PARSING \"$DB_CREATION_SCRIPT\" TO DISCOVER FILES TO DOWNLOAD..."
IFS=$(echo -en "\n\b")
for SQL_FILE_NAME in $(cat $DB_CREATION_SCRIPT | grep --only-matching "^\\s*cat\\s\+\"[0-9]\+[^\|]\+"  | grep --only-matching "\"[^\"]\+\"" | grep --only-matching "[^\"]\+")
do
    echo "### DOWNLOADING \"$GITHUB_REPO_URL_BASE/database/pgsql/$SQL_FILE_NAME\"..."
    curl -sSL "$GITHUB_REPO_URL_BASE/database/pgsql/$( echo "$SQL_FILE_NAME" | sed 's/ /%20/g' )" -o "$SQL_FILE_NAME"
done

echo "### RUN DATABASE CREATION SCRIPTS..."
chmod +x "$DB_CREATION_SCRIPT"
# Environment variable `OC_ADMIN_PASSWORD` will be used to create the `ocAdmin` user
export OC_ADMIN_PASSWORD
bash "$DB_CREATION_SCRIPT"
# Clear OC_ADMIN_PASSWORD
unset OC_ADMIN_PASSWORD

cd ..

echo "### DOWNLOAD AND RUN \`oc-admin\` START-UP SCRIPT..."
curl -fsSL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-admin/start_oc_admin.sh | sh

echo "### DONE."
echo ""
echo ""
docker ps | grep "oc-"
