'use strict'

const t = require('tap')
const storage = require('../lib/storage')
const abs = require('abstract-blob-store')
const concat = require('concat-stream')
const EE = require('events')

const runner = new EE()
const backing = abs()

t.plan(4)

runner.jobId = 42

storage(backing, runner)

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

process.nextTick(function () {
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
