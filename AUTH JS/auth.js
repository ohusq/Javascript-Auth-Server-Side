const http = require('http');
const url = require('url');

const allowedIPs = {
  '::ffff:127.0.0.1': { user: 'admin', password: 'admin' }, // localhost
  '::1': { user: 'admin', password: 'admin' }, // localhost
};

function getClock() {
  const date = new Date();
  const currentDate = date.toISOString().split('T')[0];
  const currentTime = date.toTimeString().split(' ')[0];
  return `${currentDate} ${currentTime}`; // YYYY-MM-DD HH:MM:SS
}

const server = http.createServer((req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Parse the query parameters from the URL
  const parsedUrl = url.parse(req.url, true);
  const user = encodeURIComponent(parsedUrl.query.user.trim());
  const pass = encodeURIComponent(parsedUrl.query.pass.trim());

  // Check if the user and password are valid
  if (allowedIPs[ipAddress] && user === allowedIPs[ipAddress].user && pass === allowedIPs[ipAddress].password) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ user, pass }));
    console.log(`Access granted for IP: ${ipAddress} / ${allowedIPs[ipAddress].user} @ ${getClock()}`);
  } else {
    res.statusCode = 403;
    console.log(`Access denied for IP: ${ipAddress} @ ${getClock()}`);
    res.end('Access denied');
  }
});

const port = 1234;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
