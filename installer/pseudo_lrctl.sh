#!/usr/bin/env sh

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-26
# Description: Pseudo LRCTL command. To deploy `oc-admin`, `oc-db` and ancilaries
#              Put the `ocAdmin` password in the environment variable `OC_ADMIN_PASSWORD`.
#              If `OC_ADMIN_PASSWORD` env. variable isn't already set to a password of at
#              Least 6 characters long, the user will be prompted for a new one.
# =============================================

# echo "### CHECKING GIT IS INSTALLED..."
if command -v "git" &> /dev/null; then
  # echo "Git is present"
  echo ""
else
  echo "Git not installed. Please install it prior to running this script."
  echo "Run the following:"
  echo "yum -y install git"
  exit 1
fi

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
  read -sp 'Password: ' OC_ADMIN_PASSWORD
  echo ""
  echo ""
done

echo "### DOWNLOAD AND RUN \`oc-db\` START-UP SCRIPT..."
curl -fsSL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-db/_docker.run-oc-db.sh | sh

echo "### CLONE GIT REPO..."
git clone https://github.com/logrhythm/EZ-Cloud.git

echo "### WALK IN \`EZ-Cloud\` DIRECTORY..."
cd "EZ-Cloud"

echo "### SWITCHING TO THE CURRENT BRANCH..."
git checkout v0.9

echo "### WALK IN \`database/pgsql\` DIRECTORY..."
cd database/pgsql/

echo "### RUN DATABASE CREATION SCRIPTS..."
chmod +x create_database.sh
# Environment variable `OC_ADMIN_PASSWORD` will be used to create the `ocAdmin` user
./create_database.sh

echo "### DOWNLOAD AND RUN \`oc-admin\` START-UP SCRIPT..."
curl -fsSL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-admin/start_oc_admin.sh | sh

