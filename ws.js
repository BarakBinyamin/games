const uWS            = require('uWebSockets.js')
const Queue          = require('./queue.js')
const { v4: uuidv4 } = require('uuid')

let queue           =  new Queue()    // [{id,cursorX,cursorY}]
let clients         = {}              // id:{id,conn}
let NOTIFY_INTERVAL = 39              // 34  ms
let UPDATE_INTERVAL = 39              // 34  ms
let state           = {}              // id:{id,x,y,color,raudis}
let COLORS          = ['red','aqua', 'magenta', 'red', 'skyblue']
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
    ws['id']       = id
    const randomX = Math.floor(Math.random() * 1000)
    const randomY = Math.floor(Math.random() * 1000)
    const randomColorIndex = Math.floor(Math.random() * COLORS.length)
    const RandomColor      = COLORS[randomColorIndex]
    clients[id] = {
      conn   : ws, 
      id     : id,
    }
    state[id] = {
      id     : id,
      x      : randomX,
      y      : randomY,
      radius : 40,
      cursorX: randomX,
      cursorY: randomY,
      color  : RandomColor
    }
    // create board and add board position 
  },

  message: (ws, message) => {

    const event = Buffer.from(message).toString() // { id, cursorX, cursorY}
    const json_package = JSON.parse(event)
    json_package['id'] = ws.id
    queue.enqueue(json_package)
  },

  close: (ws) => {
    delete clients[ws.id]
    delete state[ws.id]
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
async function updateGame(){
  for (const [key, client] of Object.entries(state)){
    const id                 = client.id
    const {x, y}             = state[id]
    const {cursorX, cursorY} = client
    const dx = (x - cursorX)
    const dy = (y - cursorY)
    if (dx*dx + dy*dy != 0){
      const mag = (1/Math.sqrt(dx*dx + dy*dy)) * 2
      state[id].x = x -mag*dx
      state[id].y = y -mag*dy
    }
    // console.log(Math.floor(Math.random() * COLORS.length), state)
  }
  // determine collisions and radius next
}

async function main(){
  setInterval(updateGame, UPDATE_INTERVAL)
  setInterval(sendUpdate, NOTIFY_INTERVAL)
  while (true){
    const {id,cursorX,cursorY,radius} = await queue.dequeue() // { id, cursorX, cursorY, radius }
    state[id].cursorX = cursorX
    state[id].cursorY = cursorY
    // console.log(state)
  }
}


main()