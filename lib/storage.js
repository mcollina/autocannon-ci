'use strict'

const path = require('path')

function wireStorage (backing, runner) {
  const base = `run-${runner.jobId}`

  runner.on('bench', onBench)
  runner.on('done', stop)

  return {
    stop
  }

  function stop () {
    runner.removeListener('bench', onBench)
  }

  function onBench (data, cannon) {
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
}

module.exports = wireStorage

