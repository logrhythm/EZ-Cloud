# EZ-Cloud
 EZ-Cloud for Legacy SIEM

# Backend:
## Setup
### Microsoft Windows

```
cd backend
npm install
npm install -g node-windows
npm link node-windows
net start "EZ-Cloud Server"
netsh advfirewall firewall add rule name="EZ-Cloud - Backend server (TCP/8400)" dir=in action=allow protocol=TCP localport=8400
```

## Development

### Coding

```
cd backend
npm run dev
```

### Lint

```
cd backend
npm run lint
```

### Test

```
cd backend
npm run test
```

# Frontend:
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
