'use strict'

const debug = require('debug')('autocannon-ci:storage')
const path = require('path')
const concat = require('concat-stream')
const rimraf = require('rimraf')
const steed = require('steed')
const glob = require('glob')
const pump = require('pump')
const fs = require('fs')
const EE = require('events')
const dashboard = require('./dashboard')
const runPage = require('./run-page')

function Storage (backing, runner) {
  const meta = 'meta.json'

  const res = new EE()
  res.nextJobId = nextJobId
  res.wire = wire

  return res

  function wire (runner) {
    runner.on('bench', onBench)
    runner.on('done', runnerDone)
    runner.on('flamegraph', copyFlamegraph)
  }

  function nextJobId (cb) {
    backing.createReadStream(meta)
      .on('error', function (err) {
        if (err) {
          debug('nextJobId error', err)
        }

        cb(null, 1)
      })
      .pipe(concat(function (data) {
        try {
          const content = JSON.parse(data)
          cb(null, content.nextId || 1)
        } catch (err) {
          this.emit('error')
        }
      }))
      .on('error', cb)
  }

  function onBench (data, cannon) {
    const base = `run-${this.jobId}`
    const metaToWrite = Object.assign({}, data, { server: undefined })

    backing
      .createWriteStream(path.join(base, data.name, 'meta.json'))
      .on('error', handleErr)
      .end(JSON.stringify(metaToWrite, null, 2))

    cannon.on('done', function (results) {
      backing
        .createWriteStream(path.join(base, data.name, 'results.json'))
        .on('error', handleErr)
        .end(JSON.stringify(results, null, 2))
    })
  }

  function runnerDone (results) {
    const id = this.jobId
    const base = `run-${this.jobId}`

    backing
      .createWriteStream(path.join(base, 'index.html'))
      .on('error', handleErr)
      .end(runPage(this, results))

    backing.exists(meta, (err, exists) => {
      if (err) {
        this.emit('error', err)
        return
      }

      if (exists) {
        backing.createReadStream(meta)
          .pipe(concat(function (data) {
            const content = JSON.parse(data)
            content.runs.unshift({ id, path: base, results })
            content.nextId = id + 1
            writeMeta(content)
          }))
      } else {
        writeMeta({
          nextId: id + 1,
          runs: [{ id, path: base, results }]
        })
      }
    })
  }

  function writeMeta (content) {
    res.emit('meta', content)

    backing
      .createWriteStream(meta)
      .end(JSON.stringify(content, null, 2))

    backing
      .createWriteStream('index.html')
      .end(dashboard(content))
  }

  function copyFlamegraph (data, p) {
    const base = `run-${this.jobId}`
    debug('copyFlamegraph', data, p)
    glob(path.join(p, '*'), function (err, files) {
      handleErr(err)

      steed.each(files, (file, cb) => {
        const dest = path.join(base, data.name, path.basename(file))
        debug('copying', file, dest)
        pump(
          fs.createReadStream(file),
          backing.createWriteStream(dest),
          function (err) {
            handleErr(err)
            cb()
          })
      }, () => {
        debug('copy finished')
        rimraf(p, function () {
          debug
        })
      })
    })
  }

  function handleErr (err) {
    if (err) {
      // if this happen we are seriously broken
      // better fold
      throw err
    }
  }
}

module.exports = Storage

