'use strict'

const tap = require('tap')
const beforeEach = tap.beforeEach
const rimraf = require('rimraf')
const path = require('path')
const os = require('os')

const dest = path.join(os.tmpdir(), 'auto-ci-runner-tests')

beforeEach(function (done) {
  rimraf(dest, done)
})
