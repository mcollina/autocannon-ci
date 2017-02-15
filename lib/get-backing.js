'use strict'

const path = require('path')
const bloomrun = require('bloomrun')()
const fsBlobStorage = require('fs-blob-store')
const s3BlobStorage = require('s3-blob-store')
const aws = require('aws-sdk')

bloomrun.add({
  type: 'fs'
}, function (storage, wd) {
  const dest = path.resolve(path.join(wd, storage.path || 'perf-results'))
  return fsBlobStorage(dest)
})

bloomrun.add({
  type: 's3',
  S3_ACCESS_KEY: /.+/,
  S3_SECRET_KEY: /.+/,
  bucket: /.+/,
  region: /.+/
}, function (storage) {
  const client = new aws.S3({
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
    region: storage.region
  })

  const store = s3BlobStorage({
    client,
    bucket: storage.bucket
  })

  return store
})

bloomrun.add({
  type: 's3',
  bucket: /.+/,
  region: /.+/
}, function (storage) {
  const client = new aws.S3({
    region: storage.region
  })

  const store = s3BlobStorage({
    client,
    bucket: storage.bucket
  })

  return store
})

function getBacking (config, wd) {
  const toLookup = Object.assign({}, process.env, config.storage)
  const factory = bloomrun.lookup(toLookup)

  if (factory) {
    return factory(toLookup, wd)
  }

  return null
}

module.exports = getBacking
