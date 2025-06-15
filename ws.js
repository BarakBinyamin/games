const uWS            = require('uWebSockets.js')
const Queue          = require('./queue.js')
const { v4: uuidv4 } = require('uuid')

let queue           =  new Queue()    // [{id,cursorX,cursorY}]
let clients         = {}              // [{id,x,y,conn}]
let UPDATE_INTERVAL = 1000            // 34  ms
let state           = {}              // [{id,}]

// 10k x 10k
// id radius mousex, mousey 
// event, direction, id
// first

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
    const randomX = Math.floor(Math.random() * 1000)
    const randomY = Math.floor(Math.random() * 1000)
    clients[id] = {
      conn   : ws, 
      id     : id,
      x      : randomX,
      y      : randomY,
      radius : 1
    }
    // create board and add board position 
  },

  message: (ws, message) => {
    const event = Buffer.from(message).toString() // { id, cursorX, cursorY}
    queue.enqueue(JSON.parse(event))
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
      state = objects.map((obj) => {
        delete obj.conn;
        return obj;
      })
      client.conn.send(JSON.stringify(state))
    }catch(err){
        console.log(err)
    }
  }
}

async function main(){
  setInterval(sendUpdate, UPDATE_INTERVAL)
  while (true){
    const {id,cursorX,cursorY,radius} = await queue.dequeue() // { id, cursorX, cursorY, radius }
    const velocity   = 1
    const positionX  = clients[id].x
    const positionY  = clients[id].y
    clients[id].positionX = positionX>cursorX  ? positionX+velocity : positionX-velocity
    clients[id].positionY = positionY>cursorY  ? positionY+velocity : positionY-velocity
  }
}


main()