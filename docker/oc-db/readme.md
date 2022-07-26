# `oc-db` Folder

## What do you want to do?
- Run the `oc-db` Docker image
  - Deploy on your host:
    - Docker
  - Get and run `_docker.run-oc-db.sh`
    - `curl -fsSL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-db/_docker.run-oc-db.sh | sh`
- Build the `oc-db` image
  - Deploy on your host:
    - Docker
    - `Dockerfile` in the same directory
    - `docker-entrypoint-initdb.d/` in the same directory
  - Get and run: `_docker.build-oc-db.sh`
    - `curl -fsSOL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-db/Dockerfile https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-db/_docker.build-oc-db.sh | sh`

**Below is the detailed description of the scripts present in this directory.**

---

## `_docker.build-oc-db.sh`
### Description:
Create the named volume and Start PostgreSQL container `oc-db`.

### Pre reqs:
- Docker
- File `Dockerfile` in the same directory

### Usage:
`_docker.build-oc-db.sh [OPTIONS]`

### Options:

| Param | Description |
| - | - |
| --help | Shows Help message |
| --nopublish | Skips publishing to Docker Hub |

If no option/parameter is provided, the script will build the `oc-db` container Production image and publish it.

---

## `_docker.run-oc-db.sh`
### Description:
Create the named volume, Pull and Start PostgreSQL container `oc-db`

### Pre reqs:
- Docker

### Usage:
`_docker.run-oc-db.sh`

### Options:
None.

The script will start \`oc-db\`.

---

## `docker-entrypoint-initdb.d/init-extension-pgcrypto.sql`
### Description:
Add `pgcrypto` Extension to PostgreSQL

### Pre reqs:
None.

### Usage:
Auto run at first start of the `oc-db` container.

### Options:
None.

The script will be ran automatically by PostgreSQL inside of the `oc-db` container.

---

## `docker-entrypoint-initdb.d/init-pg_hba.sh`
### Description:
Lock down access to `oc-db` to inside the container and specific containers, based on host name, user name and DB name.

### Pre reqs:
None.

### Usage:
Auto run at first start of the `oc-db` container.

### Options:
None.

The script will be ran automatically by PostgreSQL inside of the `oc-db` container.

---


