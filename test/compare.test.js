'use strict'

const t = require('tap')
const test = t.test
const compare = require('../lib/compare')

const results = require('./result')

test('compare with itself should have no winner', function (t) {
  const res = compare(results, results)

  t.match(res, {
    root: {
      'requests': {
        'difference': '0%',
        'significant': ''
      },
      'throughput': {
        'difference': '0%',
        'significant': ''
      },
      'latency': {
        'difference': '0%',
        'significant': ''
      },
      'aWins': false,
      'bWins': false,
      'equal': true
    },
    b: {
      'requests': {
        'difference': '0%',
        'significant': ''
      },
      'throughput': {
        'difference': '0%',
        'significant': ''
      },
      'latency': {
        'difference': '0%',
        'significant': ''
      },
      'aWins': false,
      'bWins': false,
      'equal': true
    }
  })
  t.end()
})
