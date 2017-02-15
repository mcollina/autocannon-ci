'use strict'

const debug = require('debug')('autocannon-ci:runner')
const spawn = require('child_process').spawn
const EE = require('events')
const inherits = require('util').inherits
const fastq = require('fastq')
const parse = require('shell-quote').parse
const request = require('request')
const autocannon = require('autocannon')
const psTree = require('ps-tree')
const glob = require('glob')
const path = require('path')

function Runner (opts, jobId, cwd, nodePath) {
  if (!(this instanceof Runner)) {
    return new Runner(opts, jobId, cwd, nodePath)
  }

  EE.call(this)

  this.opts = opts
  this.jobId = jobId
  this.cwd = cwd
  this.nodePath = nodePath

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
  const server = spawn(this.nodePath, cmd, {
    cwd: this.cwd
  })
  const toEmit = {
    cmd,
    exe: this.nodePath,
    url: data.options.url
  }

  var closed = false

  const cleanup = (err) => {
    if (closed) {
      return
    }

    var pids

    debug('cleanup', err)
    closed = true
    server.removeListener('close', cleanup)
    server.on('close', () => {
      debug('server closed gracefully')

      if (!pids || err) {
        setImmediate(cb, err)
        return
      }

      var p = path.join(this.cwd, 'profile-*')

      glob(p, (err, files) => {
        if (err) {
          debug(err)
          cb()

          // do nothing, there is no profile-* stuff in there
          // 0x did not work properly
          return
        }

        const match = files.filter(path => {
          return pids.some(pid => path.indexOf(pid) >= 0)
        })[0]

        if (match) {
          this.emit('flamegraph', data, match)
        }

        cb()
      })
    })

    if (cannon) {
      cannon.stop()
    }

    psTree(server.pid, function (err, procData) {
      if (err) {
        debug('psTree errored', err)
      }

      debug('server has children', pids)

      pids = procData.map(proc => proc.PID)

      server.kill('SIGINT')
    })
  }

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

    toEmit.server = server

    this.emit('server', toEmit)

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

      const opts = Object.assign({ title: data.name }, data.options)

      cannon = autocannon(opts, (err, result) => {
        cannon = null

        if (result) {
          this._results.push(result)
        }

        cleanup(err)
      })

      this.emit('bench', data, cannon)
    })
  })
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
