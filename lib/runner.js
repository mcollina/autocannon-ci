'use strict'

const debug = require('debug')('autocannon-ci:runner')
const spawn = require('child_process').spawn
const EE = require('events')
const inherits = require('util').inherits
const fastq = require('fastq')
const parse = require('shell-quote').parse
const request = require('request')
const autocannon = require('autocannon')

// get the current node path for clean windows support
const isWin = /^win/.test(process.platform)
const nodePath = isWin ? ('"' + process.argv[0] + '"') : process.argv[0]

function Runner (opts, jobId, cwd) {
  if (!(this instanceof Runner)) {
    return new Runner(opts, jobId, cwd)
  }

  EE.call(this)

  this.opts = opts
  this.jobId = jobId
  this.cwd = cwd

  this._results = []

  this.queue = fastq(this, work, 1)
  this.queue.pause()
  this.queue.drain = this.emit.bind(this, 'done', this._results)

  this._run()

  process.nextTick(this.queue.resume.bind(this.queue))
}

inherits(Runner, EE)

Runner.prototype._run = function () {
  if (typeof this.opts.benchmarks !== 'object') {
    this.emit('error', new Error('the benchmarks key in the config must be an object'))
    return
  }

  const benchmarks = Object.keys(this.opts.benchmarks)

  if (benchmarks.length === 0) {
    this.emit('error', new Error('no benchmarks required'))
    return
  }

  benchmarks.forEach((key) => {
    this.queue.push({
      name: key,
      options: this.opts.benchmarks[key]
    })
  })
}

function work (data, cb) {
  const cmd = parse(this.opts.server)
  const server = spawn(nodePath, cmd, {
    cwd: this.cwd
  })

  var closed = false

  server.on('close', function () {
    debug('cleanup from early close')
    cleanup()
  })

  var cannon = null

  waitReady(data.options.url, (err) => {
    if (err) {
      cleanup(err)
      return
    }

    if (closed) {
      return
    }

    this.emit('server', {
      cmd,
      exe: nodePath, // TODO flamegraph
      server,
      url: data.options.url
    })

    // warmup
    const warmupOpts = Object.assign({}, data.options, { duration: 3 })

    this.emit('warmup', data.options.url)

    cannon = autocannon(warmupOpts, (err, result) => {
      cannon = null

      if (err) {
        cleanup(err)
        return
      }

      if (closed) {
        return
      }

      cannon = autocannon(data.options, (err, result) => {
        cannon = null

        if (result) {
          this._results.push(result)
        }

        cleanup(err)
      })

      this.emit('bench', data, cannon)
    })
  })

  function cleanup (err) {
    debug('cleanup', err)
    closed = true
    server.removeListener('close', cleanup)
    server.on('close', function () {
      debug('server closed gracefully')
      setImmediate(cb, err)
    })

    if (cannon) {
      cannon.stop()
    }

    server.kill()
  }
}

function waitReady (url, cb, tries) {
  debug('wait', tries)
  tries = tries || 0

  request(url, function (err) {
    tries++

    if (err && tries === 10) {
      cb(err)
      return
    } else if (err) {
      setTimeout(waitReady, 1000, url, cb, tries)
      return
    }

    debug('server started')

    cb()
  })
}

module.exports = Runner
