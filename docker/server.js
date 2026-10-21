// A small Node.js web server to serve React and forward API/WebSocket.
// Backend is resolved by its Docker Compose service name: backend.
const http = require('http');
const path = require('path');
const express = require('express');
const httpProxy = require('http-proxy');

const app = express();
const server = http.createServer(app);
const backendUrl = process.env.BACKEND_URL || 'http://backend:5000';
const proxy = httpProxy.createProxyServer({
  target: backendUrl,
  ws: true,
  changeOrigin: true,
  xfwd: true
});

proxy.on('error', (error, req, res) => {
  console.error('Backend proxy error:', error.message);
  if (res && typeof res.writeHead === 'function') {
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8' });
    }
    res.end(JSON.stringify({ message: 'Backend is temporarily unavailable' }));
  } else if (res && typeof res.destroy === 'function') {
    res.destroy();
  }
});

// Keep the original /api/... path when forwarding it to Express.
app.use((req, res, next) => {
  if (req.path === '/api' || req.path.startsWith('/api/')) {
    proxy.web(req, res);
  } else {
    next();
  }
});

// React is built into /app/build by the first Dockerfile stage.
const buildDir = path.join(__dirname, 'build');
app.use(express.static(buildDir));

// React single-page routing: send index.html for browser page requests.
app.get(/.*/, (req, res, next) => {
  if (!req.accepts('html')) return next();
  res.sendFile(path.join(buildDir, 'index.html'));
});

// A WebSocket connection uses the HTTP Upgrade mechanism.
server.on('upgrade', (req, socket, head) => {
  const pathname = (req.url || '').split('?')[0];
  if (pathname === '/ws') {
    proxy.ws(req, socket, head);
  } else {
    socket.destroy();
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Frontend is listening on port ${port}`);
  console.log(`Forwarding /api and /ws to ${backendUrl}`);
});
