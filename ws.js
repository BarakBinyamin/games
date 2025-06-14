const uWS            = require('uWebSockets.js')
const Queue          = require('./queue.js')
const { v4: uuidv4 } = require('uuid')

let queue           =  new Queue()
let clients         = {}
let UPDATE_INTERVAL = 1000 //34 // ms
let state           = {li:'hi'}


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
    console.log('client connected')
    const id    = uuidv4()
    ws[id]      = id
    clients[id] = {
      conn : ws, 
      id   : id
    }
  },

  message: (ws, message) => {
    const text = Buffer.from(message).toString()
    // console.log('Received:', text)
    queue.enqueue(JSON.parse(text))
  },

  close: (ws) => {
    delete clients[ws.id]
    console.log('WebSocket closed')
  }
}).listen(9001, (token) => {
  if (token) {
    console.log('WebSocket listening on ws://localhost:9001')
  } else {
    console.log('WebSocket failed to start')
  }
});

async function sendUpdate(){
  for (const [key, client] of Object.entries(clients)){
    try{
      client.conn.send(JSON.stringify(state))
    }catch(err){
        console.log(err)
    }
  }
}

async function main(){
  setInterval(sendUpdate, UPDATE_INTERVAL)
  while (true){
    const event = await queue.dequeue()

  }
}


main()