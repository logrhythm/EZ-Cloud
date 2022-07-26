# `Docker` folder

## `oc-admin` scripts

Made up of the files in the [`./oc-admin`](./oc-admin) directory:

| File name | Description |
| --------- | ----------- |
| `start_oc_admin.sh` | Bash script to run the `oc-admin` Production container. |

---

## `oc-admin_dev` scripts

Made up of the files in the [`./oc-admin_dev`](./oc-admin_dev) directory:

| File name | Description |
| --------- | ----------- |
| `_docker.build-oc-admin_dev.sh` | Bash script to build the `oc-admin_dev` image. Must be run on the Docker host. **Pre-reqs: Docker and Git**. |
| `Dockerfile` | Docker description file for `oc-admin_dev` image |
| `_docker.run-oc-admin_dev.sh` | Bash script to run the `oc-admin_dev` container. Can be run with the `--build_only` flag to build `oc-admin` container content and die. |
| `_docker.build_oc-admin_production.sh` | Builds the `oc-admin` container using `oc-admin_dev` image. |

See [`oc-admin_dev/`](./oc-admin_dev) for more details.

## `oc-db` scripts

Made up of the files in the [`./oc-db`](./oc-db) directory:

| File name | Description |
| --------- | ----------- |
| `_docker.build-oc-db.sh` | Bash script to build the `oc-db` image. Must be run on the Docker host. **Pre-reqs: Docker**. |
| `Dockerfile` | Docker description file for `oc-db` image |
| `_docker.run-oc-db.sh` | Bash script to pull and run the `oc-db` container. |
| `docker-entrypoint-initdb.d` | Directory containing the following scripts that will start at the first run of the `oc-db` container: |
| - `init-extension-pgcrypto.sql` | SQL script to add the `pgcrypto` extension to PostgreSQL. |
| - `init-pg_hba.sh` | Bash script to create the HBA (**H**ost **B**ased **A**ccess) file to secure the container while allowing passwordless yet restricted access to if from the `oc-admin` container. |

## `oc-admin` Docker source

Made up of the files in this very directory:

| File name | Description |
| --------- | ----------- |
| `dockerContainerBuilder.js` | JS script called by WebPack at build time to create the Docker and script files from the templates below |
| `Dockerfile` | Docker description file for `oc-admin` image |
| `_docker.build-TEMPLATE.sh` | Template for the Bash script that is dropped in `dist/_docker.build.sh` |

The Docker file and script created in the `dist/` directory are then used by `_docker.build_oc-admin_production.sh`, when running on the Docker host (as opposed the container itself).