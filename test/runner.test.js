'use strict'

const t = require('tap')
const Runner = require('../lib/runner')

// get the current node path for clean windows support
const isWin = /^win/.test(process.platform)
const nodePath = isWin ? ('"' + process.argv[0] + '"') : process.argv[0]

t.plan(13)

const runner = new Runner({
  server: './server.js',
  benchmarks: {
    something: {
      connections: 20,
      duration: 2,
      url: 'http://localhost:3000'
    },
    else: {
      connections: 20,
      duration: 2,
      url: 'http://localhost:3000/b'
    }
  }
}, 42, __dirname, nodePath)

t.equal(runner.jobId, 42)

const urls = [
  'http://localhost:3000',
  'http://localhost:3000/b'
]

const serverData = [{
  cmd: ['./server.js'],
  exe: nodePath,
  url: 'http://localhost:3000'
}, {
  cmd: ['./server.js'],
  exe: nodePath,
  url: 'http://localhost:3000/b'
}]

const results = []

runner.on('server', function (data) {
  const server = data.server
  delete data.server

  t.ok(server, 'server exists')
  t.deepEqual(data, serverData.shift())
})

runner.on('warmup', function (url) {
  t.equal(url, urls.shift(), 'url matches')
})

runner.on('bench', function (data, cannon) {
  cannon.on('done', function (result) {
    t.ok('autocannon finished')
    t.ok(result.title, 'result has title')
    results.push(result)
  })
})

runner.on('done', function (_results) {
  t.pass('done emitted')
  t.deepEqual(_results, results)
})
