'use strict'

const single = require('autocannon-compare')

function compare (a, b) {
  const res = {}

  a.forEach(function (singleA) {
    b.forEach(function (singleB) {
      if (singleA.title === singleB.title) {
        res[singleA.title] = single(singleA, singleB)
      }
    })
  })

  return res
}

module.exports = compare
