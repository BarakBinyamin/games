const uWS = require('uWebSockets.js')

// send updates at a reliable rate to all clients 
// handle incoming messages/update requests in a queue
let queue = []


uWS.App().ws('/*', {
  maxPayloadLength: 16 * 1024 * 1024,

  upgrade: (res, req, context) => {
    res.upgrade(
      { url: req.getUrl() },
      req.getHeader('sec-websocket-key'),
      req.getHeader('sec-websocket-protocol'),
      req.getHeader('sec-websocket-extensions'),
      context
    );
  },

  open: (ws) => {
    console.log('WebSocket connected');
    ws.send('Hello from uWebSockets!');
  },

  message: (ws, message) => {
    const text = Buffer.from(message).toString();
    console.log('Received:', text);
    ws.send('Echo: ' + text);
  },

  close: () => {
    console.log('WebSocket closed');
  }
}).listen(9001, (token) => {
  if (token) {
    console.log('WebSocket listening on ws://localhost:9001');
  } else {
    console.log('WebSocket failed to start');
  }
});
