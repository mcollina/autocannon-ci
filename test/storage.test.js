'use strict'

const t = require('tap')
const Storage = require('../lib/storage')
const abs = require('abstract-blob-store')
const concat = require('concat-stream')
const EE = require('events')

const backing = abs()
const results = require('./result')

var storage = Storage(backing)

t.test('nextJobId with no status', function (t) {
  t.plan(2)

  storage.nextJobId(function (err, id) {
    t.error(err)
    t.equal(id, 1)
  })
})

t.test('first run', function (t) {
  t.plan(6)

  const runner = new EE()
  runner.jobId = 42

  storage.wire(runner)

  var cannon = new EE()

  runner.emit('bench', {
    name: 'first',
    meta: 'data'
  }, cannon)

  cannon.emit('done', {
    are: 'results'
  })

  cannon = new EE()

  runner.emit('bench', {
    name: 'second',
    meta: 'data2'
  }, cannon)

  cannon.emit('done', {
    are2: 'results'
  })

  storage.once('meta', function (data) {
    t.deepEqual(data, {
      nextId: 43,
      runs: [{
        id: 42,
        path: 'run-42',
        results
      }]
    })
  })

  runner.emit('done', results)

  // this will wait for all the process.nextTick
  // used by the dummy store
  setImmediate(function () {
    backing.createReadStream('meta.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          nextId: 43,
          runs: [{
            id: 42,
            path: 'run-42',
            results
          }]
        })
      }))

    backing.createReadStream('run-42/first/meta.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          name: 'first',
          meta: 'data'
        })
      }))

    backing.createReadStream('run-42/first/results.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          are: 'results'
        })
      }))

    backing.createReadStream('run-42/second/meta.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          name: 'second',
          meta: 'data2'
        })
      }))

    backing.createReadStream('run-42/second/results.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          are2: 'results'
        })
      }))
  })
})

t.test('second run', function (t) {
  t.plan(6)

  const runner = new EE()
  runner.jobId = 43

  storage.wire(runner)

  var cannon = new EE()

  runner.emit('bench', {
    name: 'first',
    meta: 'data'
  }, cannon)

  cannon.emit('done', {
    are: 'results'
  })

  cannon = new EE()

  runner.emit('bench', {
    name: 'second',
    meta: 'data2'
  }, cannon)

  cannon.emit('done', {
    are2: 'results'
  })

  storage.once('meta', function (data) {
    t.deepEqual(data, {
      nextId: 44,
      runs: [{
        id: 43,
        path: 'run-43',
        results
      }, {
        id: 42,
        path: 'run-42',
        results
      }]
    })
  })

  runner.emit('done', results)

  // this will wait for all the process.nextTick
  // used by the dummy store
  setImmediate(function () {
    backing.createReadStream('meta.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          nextId: 44,
          runs: [{
            id: 43,
            path: 'run-43',
            results
          }, {
            id: 42,
            path: 'run-42',
            results
          }]
        })
      }))

    backing.createReadStream('run-43/first/meta.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          name: 'first',
          meta: 'data'
        })
      }))

    backing.createReadStream('run-43/first/results.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          are: 'results'
        })
      }))

    backing.createReadStream('run-43/second/meta.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          name: 'second',
          meta: 'data2'
        })
      }))

    backing.createReadStream('run-43/second/results.json')
      .pipe(concat(function (data) {
        t.deepEqual(JSON.parse(data), {
          are2: 'results'
        })
      }))
  })
})

t.test('fetchMeta', function (t) {
  t.plan(2)

  storage.fetchMeta(function (err, meta) {
    t.error(err)
    t.equal(meta.runs.length, 2)
  })
})

t.test('nextJobId with status', function (t) {
  t.plan(2)

  storage.nextJobId(function (err, id) {
    t.error(err)
    t.equal(id, 44)
  })
})
