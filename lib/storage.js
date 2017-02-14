'use strict'

const debug = require('debug')('autocannon-ci:storage')
const path = require('path')
const concat = require('concat-stream')
const rimraf = require('rimraf')
const steed = require('steed')
const glob = require('glob')
const pump = require('pump')
const fs = require('fs')

function Storage (backing, runner) {
  const meta = 'meta.json'

  return {
    wire
  }

  function wire (runner) {
    runner.on('bench', onBench)
    runner.on('done', runnerDone)
    runner.on('flamegraph', copyFlamegraph)
  }

  function onBench (data, cannon) {
    const base = `run-${this.jobId}`
    const metaToWrite = Object.assign({}, data, { server: undefined })
    backing
      .createWriteStream(path.join(base, data.name, 'meta.json'))
      .end(JSON.stringify(metaToWrite, null, 2))

    cannon.on('done', function (results) {
      backing
        .createWriteStream(path.join(base, data.name, 'results.json'))
        .end(JSON.stringify(results, null, 2))
    })
  }

  function runnerDone (results) {
    const path = `run-${this.jobId}`

    backing.exists(meta, (err, exists) => {
      if (err) {
        this.emit('error', err)
        return
      }

      if (exists) {
        backing.createReadStream(meta)
          .pipe(concat(function (data) {
            const content = JSON.parse(data)
            content.runs.push({ path })
            writeMeta(content)
          }))
      } else {
        writeMeta({
          runs: [{ path }]
        })
      }
    })
  }

  function writeMeta (content) {
    backing
      .createWriteStream(meta)
      .end(JSON.stringify(content, null, 2))
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

    function handleErr (err) {
      if (err) {
        // if this happen we are seriously broken
        // better fold
        throw err
      }
    }
  }
}

module.exports = Storage

