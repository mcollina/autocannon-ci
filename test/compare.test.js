'use strict'

const t = require('tap')
const test = t.test
const compare = require('../lib/compare')

const results = require('./result')
const results2 = require('./result-2')

test('compare with itself should have no winner', function (t) {
  const res = compare(results, results2)

  t.match(res, {
    root: {
      'requests': {
        'difference': '89.27%',
        'significant': '***'
      },
      'throughput': {
        'difference': '83.76%',
        'significant': '***'
      },
      'latency': {
        'difference': '-50.06%',
        'significant': '***'
      },
      'aWins': true,
      'bWins': false,
      'equal': false
    },
    b: {
      'requests': {
        'difference': '-9.74%',
        'significant': '***'
      },
      'throughput': {
        'difference': '-10.14%',
        'significant': '**'
      },
      'latency': {
        'difference': '10.89%',
        'significant': '***'
      },
      'aWins': false,
      'bWins': true,
      'equal': false
    }
  })
  t.end()
})
