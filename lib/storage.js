'use strict'

const path = require('path')
const concat = require('concat-stream')

function Storage (backing, runner) {
  const meta = 'meta.json'

  return {
    wire
  }

  function wire (runner) {
    runner.on('bench', onBench)
    runner.on('done', runnerDone)
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
}

module.exports = Storage

