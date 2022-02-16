[![Last Release](https://badgen.net/badge/release/v0.8.2/green)](https://github.com/logrhythm/EZ-Cloud/releases)
[![Dev Version](https://badgen.net/badge/dev/v0.8.3/orange)](https://github.com/logrhythm/EZ-Cloud/tree/v0.8.2)

# EZ-Cloud
 EZ-Cloud On-Boarder for Core SIEM

Check [Releases](https://github.com/logrhythm/EZ-Cloud/releases) for version specific instructions.

# Backend:

## Requirements
- NodeJS (v12.16 or above)
- MS SQL (v2016 or above)

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
  - Updates Version
  - Build and Import Frontend
  - Build the Backend
    - Webpack
    - Creates the Zip files
      - Without NodeJS
      - With NodeJS
    - Creates the Installer
```
npm run buildWithFrontend
```

- Backend build
  - Updates Version
  - Webpack
  - Creates the Zip files
    - Without NodeJS
    - With NodeJS
  - Creates the Installer
```
npm run build
```

- Build and Import Frontend
```
npm run buildFrontendAndImport
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
