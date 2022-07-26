# `oc-admin_dev` Folder

## What do you want to do?
- Run an environment to be able to work on the code of OC Admin backend, Frontend, EZ Market Backend or EZ Market Frontend
  - Deploy on your host:
    - Docker
  - Get and run: `_docker.run-oc-admin_dev.sh`
    - `curl -fsSOL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-admin_dev/_docker.run-oc-admin_dev.sh && sh _docker.run-oc-admin_dev.sh`
- Build the `oc-admin` Docker image based on the latest code
  - Deploy on your host:
    - Docker
  - Get:
    - `_docker.run-oc-admin_dev.sh`
    - `_docker.build_oc-admin_production.sh`
  - Run `_docker.build_oc-admin_production.sh`
    - `curl -fsSOL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-admin_dev/_docker.run-oc-admin_dev.sh https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-admin_dev/_docker.build_oc-admin_production.sh | sh`
- Build the `oc-admin_dev` image
  - Deploy on your host:
    - Docker
    - Git CLI
  - Get and run: `_docker.build-oc-admin_dev.sh`
    - `curl -fsSL https://raw.githubusercontent.com/logrhythm/EZ-Cloud/v0.9/docker/oc-admin_dev/_docker.build-oc-admin_dev.sh | sh`

**Below is the detailed description of the scripts present in this directory.**

---

## `_docker.build-oc-admin_dev.sh`
### Description:
Build the Dev version of the OC-Admin container `oc-admin_dev`.

### Pre reqs:
- Docker
- Git
- File `Dockerfile` in the same directory

### Usage:
`_docker.build-oc-admin_dev.sh [OPTIONS]`

### Options:

| Param | Description |
| - | - |
| --help | Shows Help message |
| --nopublish | Skips publishing to Docker Hub |

If no option/parameter is provided, the script will build the `oc-admin_dev` container image and publish it.

---

## `_docker.run-oc-admin_dev.sh`
### Description:
Pull and Start Dev version of the OC-Admin container `oc-admin_dev`.

Can be used to just build the content of the `oc-admin` container, with the `--build_only` flag.

### Pre reqs:
- Docker

### Usage:
`_docker.run-oc-admin_dev.sh [OPTIONS]`

### Options:

| Param | Description |
| - | - |
| --help | Shows Help message |
| --build_only | Run, build Frontend and Backend, then quit |

If no option/parameter is provided, the script will start \`oc-admin_dev\` which will stay running until killed.

---

## `_docker.build_oc-admin_production.sh`
### Description:
Check Dev version of the OC-Admin container `oc-admin_dev` is running, and use it to build the `oc-admin` container's content prior to call the Docker command to build the `oc-admin` container.

If no running `oc-admin_dev` is found, it spins a temporary one, unless parameter `--notempimage` is present.

### Pre reqs:
- Docker
- Script `_docker.run-oc-admin_dev.sh` in the same directory

### Usage:
`_docker.build_oc-admin_production.sh [OPTIONS]`

### Options:

| Param | Description |
| - | - |
| --help | Shows Help message |
| --nopublish | Skips publishing to Docker Hub |
| --notempimage | Do not use temporary image if `oc-admin_dev` isn't already running |

If no option/parameter is provided, the script will attempt to use the currently running \`oc-admin_dev\`" image, if none, it will spin a temporary one.
