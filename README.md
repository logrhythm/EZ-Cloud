# EZ-Cloud
 EZ-Cloud for Legacy SIEM

## Setup
### Microsoft Windows

```
npm install -g node-windows
npm link node-windows
npm install
net start "EZ-Cloud Server"
netsh advfirewall firewall add rule name="EZ-Cloud - Backend server (TCP/8400)" dir=in action=allow protocol=TCP localport=8400
```

## Development

### Coding

```
npm run dev
```

### Lint

```
npm run lint
```

### Test

```
npm run test
```

