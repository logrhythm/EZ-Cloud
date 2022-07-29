[![Last Release](https://badgen.net/badge/release/v0.9.5/green)](https://github.com/logrhythm/EZ-Cloud/releases/tag/v0.9.5)
[![Dev Version](https://badgen.net/badge/dev/v0.9/orange)](https://github.com/logrhythm/EZ-Cloud/tree/v0.9)

# OC Admin (Formerly EZ-Cloud)
Open Collector Admin and On-Boarder for Core SIEM

Check [Releases](https://github.com/logrhythm/EZ-Cloud/releases) for version specific instructions.

# Backend:

## Requirements
### Windows Standalone version
- NodeJS (v12.16 or above)
- MS SQL (v2016 or above, on the XM or PM)

### Linux Standalone version
- NodeJS (v12.16 or above)
- MS SQL (v2016 or above, on the XM or PM)

### Containerised version
- Docker

## Setup
See [Releases](https://github.com/logrhythm/EZ-Cloud/releases) for version specific installation instructions

## Know issues :bug: :beetle:
See [Releases](https://github.com/logrhythm/EZ-Cloud/releases) for version specific issues

## Report a bug or issue
- Use the [Issues](https://github.com/logrhythm/EZ-Cloud/issues) on GitHub

## Development

### Coding

```
npm run dev
```

### Lint

Ideally use a Lint extension in your IDE (I use ESLint in VS Code).

Running Lint from the command line will attempt to fix (`--fix`) the code.
```
npm run lint
```

### Test

```
npm run test
```

### Build
- Full build
  - Updates Version (![Windows](/medias/Windows_logo_16x16.png "Windows"), ![Linux](/medias/Linux_logo_14x16.png "Linux") & ![Docker](/medias/Docker_logo_23x16.png "Docker"))
  - Build and Import Frontend (![Windows](/medias/Windows_logo_16x16.png "Windows"), ![Linux](/medias/Linux_logo_14x16.png "Linux") & ![Docker](/medias/Docker_logo_23x16.png "Docker"))
  - Build the Backend (![Windows](/medias/Windows_logo_16x16.png "Windows"), ![Linux](/medias/Linux_logo_14x16.png "Linux") & ![Docker](/medias/Docker_logo_23x16.png "Docker"))
    - Webpack (![Windows](/medias/Windows_logo_16x16.png "Windows"), ![Linux](/medias/Linux_logo_14x16.png "Linux") & ![Docker](/medias/Docker_logo_23x16.png "Docker"))
    - Creates the Zip files (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
      - Without NodeJS (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
      - With NodeJS (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
    - Creates the Installer (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
    - Creates the Docker creation file and script (![Docker](/medias/Docker_logo_23x16.png "Docker") only)
```
# For Windows:
npm run buildWindowsFull
# For Docker:
npm run buildDockerFull
```

- Backend build (![Windows](/medias/Windows_logo_16x16.png "Windows"), ![Linux](/medias/Linux_logo_14x16.png "Linux") & ![Docker](/medias/Docker_logo_23x16.png "Docker"))
  - Updates Version (![Windows](/medias/Windows_logo_16x16.png "Windows"), ![Linux](/medias/Linux_logo_14x16.png "Linux") & ![Docker](/medias/Docker_logo_23x16.png "Docker"))
  - Webpack (![Windows](/medias/Windows_logo_16x16.png "Windows"), ![Linux](/medias/Linux_logo_14x16.png "Linux") & ![Docker](/medias/Docker_logo_23x16.png "Docker"))
  - Creates the Zip files (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
    - Without NodeJS (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
    - With NodeJS (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
  - Creates the Installer (![Windows](/medias/Windows_logo_16x16.png "Windows") only)
  - Creates the Docker creation file and script (![Docker](/medias/Docker_logo_23x16.png "Docker") only)
```
# For Windows:
npm run buildWindows
# For Docker:
npm run buildDocker
```

- Build and Import Frontend
```
# On Windows:
npm run buildWindowsFrontendAndImport
# On Linux:
npm run buildDockerFrontendAndImport
```

### TODO
Check Backend [TODO](TODO.md) list.

# Frontend:

See [Frontend](frontend/) for more information.

## Setup

```
cd frontend
npm install
```

## Development

### Coding

```
cd frontend
quasar dev --modern
```
### TODO

Check Frontend [TODO](frontend/TODO.md) list.

# EZ Cloud Market Place:

See [EZ-Market-Place](ez-market-place/) for more information.

## Setup

```
cd ez-market-place
npm install
```

## Development

### Coding

```
cd ez-market-place
npm run dev
```

### Lint

Ideally use a Lint extension in your IDE (I use ESLint in VS Code).

Running Lint from the command line will attempt to fix (`--fix`) the code.
```
npm run lint
```

### Test

```
npm run test
```
