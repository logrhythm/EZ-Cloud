#!/usr/bin/env bash

# =============================================
# Author:      Tony Massé
# Create date: 2022-07-26
# Modified on: 2022-07-27 - To remove dependency to Git, and avoid downloading the whole GitHub Repo
# Modified on: 2022-08-05 - To remove dependency to Dev branch
# Modified on: 2022-08-05 - To make it more flexible by using parameters
# Modified on: 2022-08-05 - To add password verification (ask user to re-type the pass and compare)
# Description: Pseudo LRCTL command. To deploy `oc-admin`, `oc-db` and ancilaries
#              Put the `ocAdmin` password in the environment variable `OC_ADMIN_PASSWORD`.
#              If `OC_ADMIN_PASSWORD` env. variable isn't already set to a password of at
#              Least 6 characters long, the user will be prompted for a new one.
# =============================================

# Default values
DEFAULT_GITHUB_REPO_ROOT_URL_BASE="https://raw.githubusercontent.com/logrhythm/EZ-Cloud/"
DEFAULT_GITHUB_REPO_BRANCH="main"
DEFAULT_DB_CREATION_SCRIPT="create_database.sh"
DO_NOT_PROMPT=0

# Parameters parsing
while [ $# -gt 0 ]; do
  case "$1" in
    --help)
      echo ""
      echo "Usage:  pseudo_lrctl.sh [OPTIONS]"
      echo ""
      echo "Options:"
      echo "   --help                Shows this help"
      echo "   --repo-url            Base URL for the Repository. Must include the final slash. Defaults to: $DEFAULT_GITHUB_REPO_ROOT_URL_BASE"
      echo "   --repo-branch         Branch of the Repository. Defaults to: $DEFAULT_GITHUB_REPO_BRANCH"
      echo "   --db-reation-script   Name of the script that creates the database structure. Defaults to: $DEFAULT_DB_CREATION_SCRIPT"
      echo "   --ocadmin-password    Password for the ocAdmin account to be created. UNSAFE. You really want to enter it when prompted, or put"
      echo "                         that password in the OC_ADMIN_PASSWORD environment variable then run this again withOUT the --ocadmin-password parameter"
      echo "   --do-not-prompt       Will not prompt for anything. If no ocAdmin password was provided, a random one will be silently generated and used"
      echo ""
      echo "Password policy:"
      echo " - Password should have a mix of lowercase, uppercase, number and signs/non-alphanumerical characters"
      echo " - Password must have a minimum of 6 characters"
      echo "If a password that is less than 6 characters long is provided in the OC_ADMIN_PASSWORD environment variable or with the --ocadmin-password parameter,"
      echo "you will be prompted again, unless the --do-not-prompt parameter is used."
      echo "If no password is provided via the environment variable or parameter, and --do-not-prompt is used, a random password will be silently generated. This"
      echo "will prevent anyone from being able to login OC-Admin UI, but will deploy the containers correctly."
      echo ""
      exit 0
      ;;
    --repo-url)
      GITHUB_REPO_ROOT_URL_BASE="$2"
      shift
      ;;
    --repo-branch)
      GITHUB_REPO_BRANCH="$2"
      shift
      ;;
    --db-reation-script)
      DB_CREATION_SCRIPT="$2"
      shift
      ;;
    --ocadmin-password)
      OC_ADMIN_PASSWORD="$2"
      shift
      ;;
    --do-not-prompt)
      DO_NOT_PROMPT=1
      ;;
    --*)
      echo "Unknown option $1"
      ;;
  esac
  shift $(( $# > 0 ? 1 : 0 ))
done

# Variables building
if [ -z "$GITHUB_REPO_BRANCH" ]; then
  GITHUB_REPO_BRANCH=$DEFAULT_GITHUB_REPO_BRANCH
fi

if [ -z "$GITHUB_REPO_ROOT_URL_BASE" ]; then
  GITHUB_REPO_ROOT_URL_BASE=$DEFAULT_GITHUB_REPO_ROOT_URL_BASE
fi

GITHUB_REPO_URL_BASE=$GITHUB_REPO_ROOT_URL_BASE$GITHUB_REPO_BRANCH

if [ -z "$DB_CREATION_SCRIPT" ]; then
  DB_CREATION_SCRIPT=$DEFAULT_DB_CREATION_SCRIPT
fi

echo "### CREATE \`logrhythm\` NETWORK..."
docker network create logrhythm

echo "### DOWNLOAD AND RUN \`oc-db\` START-UP SCRIPT..."
curl -fsSL "$GITHUB_REPO_URL_BASE/docker/oc-db/_docker.run-oc-db.sh" | sh

echo "### SLEEPING 5 SECONDS TO GIVE \`oc-db\` A CHANCE TO START-UP..."
sleep 5

echo ""
echo "Please provide a password for the default user is ocAdmin."
echo "Or press [CTRL]+[C] to abandon."
echo ""
echo "Rules:"
echo " - Password should have a mix of lowercase, uppercase, number and signs/non-alphanumerical characters"

# Prompt for pass if `OC_ADMIN_PASSWORD` isn't already set with at least a 6 character long password
# And keep looping until a 6+ character long password is provided, or user press CTRL+C
# Password verification is prompted to make sure the user knows which password it is, unlike Brandon Pace
PASSWORDS_DIDNT_MATCH=0
until [ ${#OC_ADMIN_PASSWORD} -gt 6 ] || [ $DO_NOT_PROMPT -eq 1 ]
do
  until [ ${#OC_ADMIN_PASSWORD_ONE} -gt 6 ]
  do
    if [ $PASSWORDS_DIDNT_MATCH -eq 0 ]; then
      echo " - Password must have a minimum of 6 characters"
    fi
    echo ""
    read -sp 'Password: ' OC_ADMIN_PASSWORD_ONE </dev/tty
    echo ""
    PASSWORDS_DIDNT_MATCH=0
  done
  read -sp 'Please re-enter to verify: ' OC_ADMIN_PASSWORD_TWO </dev/tty
  echo ""
  echo ""
  if [ "$OC_ADMIN_PASSWORD_ONE" = "$OC_ADMIN_PASSWORD_TWO" ]; then
    OC_ADMIN_PASSWORD="$OC_ADMIN_PASSWORD_ONE"
  else
    echo "Error: Passwords do not match. Please try again."
    PASSWORDS_DIDNT_MATCH=1
  fi
  OC_ADMIN_PASSWORD_ONE=""
  OC_ADMIN_PASSWORD_TWO=""
done

unset OC_ADMIN_PASSWORD_ONE
unset OC_ADMIN_PASSWORD_TWO

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
curl -fsSL "$GITHUB_REPO_URL_BASE/docker/oc-admin/start_oc_admin.sh" | sh

echo "### DONE."
echo ""
echo ""
docker ps | grep "oc-"
