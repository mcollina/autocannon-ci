'use strict'

const html = require('bel')
const template = require('./template')

function render (data) {
  return template('Dashboard', body.bind(null, data))
}

function body (data) {
  return html`this is the body`
}

module.exports = render
