# OC Admin Client (ez-cloud-client) - Formerly EZ Cloud

OpenCollector User Interface

## Install the dependencies
```bash
npm install
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev
```

### Lint the files
```bash
npm run lint
```

### Build the app for production
```bash
quasar build
```

### Serve the production build locally
After building, you can serve the production build locally for testing:

```bash
# Install http-server globally (if not already installed)
npm install -g http-server

# Serve the production build on port 8080
# Use -a 0.0.0.0 to make it accessible from other machines on your network
npx http-server dist/spa -p 8080 -a 0.0.0.0
```

The app will be available at:
- Local machine: `http://localhost:8080`
- Other machines on network: `http://<your-ip-address>:8080`

**Note:** Without the `-a 0.0.0.0` flag, the server will only be accessible from the local machine (localhost).

### Customize the configuration
See [Configuring quasar.conf.js](https://v1.quasar.dev/quasar-cli/quasar-conf-js).
