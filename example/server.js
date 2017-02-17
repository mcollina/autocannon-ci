'use strict'

const http = require('http')
const server = http.createServer(handle)

function handle (req, res) {
  if (req.url === '/b') {
    setTimeout(loop, 25, res)
  } else {
    setTimeout(loop, 5, res)
  }
}

function loop (res) {
  for (var i = 0; i < Math.pow(2, 8); i++) {
    // hurray!
  }
  res.end('loop finished!!!')
}

server.listen(3000)
