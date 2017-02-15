'use strict'

const html = require('bel')
const template = require('./template')
const prettyBytes = require('pretty-bytes')

function render (runner, data) {
  return template(`Job ${runner.jobId}`, body.bind(null, runner, data))
}

function body (runner, data) {
  return html`
<div class="fl w-100 pa4">
  ${data.map(bench, runner)}
</div>
`
}

function bench (data) {
  var flamegraph = ''

  if (this.flamegraph) {
    flamegraph = html`
<a class="fl w-50" href="${data.title + '/flamegraph.html'}" target="_blank">
  <img class="fr mw-30 h5" src="${data.title + '/flamegraph.svg'}">
</a>
`
  }

  return html`
<div class="fl w-100 db mv2">
  <h2 class="bb bw2">${data.title}</h2>
  <table class="collapse ba br2 b--black-10 pv2 ph3 fl w-50">
    ${row('URL', data.url)}
    ${row('req/s', data.requests.mean + ' \u00B1 ' + data.requests.stddev)}
    ${row('latency', data.latency.mean + ' ms \u00B1 ' + data.latency.stddev)}
    ${row('throughput',
          prettyBytes(data.throughput.mean) +
            '/s \u00B1 ' + prettyBytes(data.throughput.stddev) + '/s')}
    ${row('duration', data.duration + ' s')}
    ${row('connections', data.connections)}
    ${row('pipelining', data.pipelining)}
    ${data.errors ? row('errors', data.errors) : ''}
  </table>
  ${flamegraph}
</div>
`
}

function row (key, value) {
  return html`
<tr class="striped--light-gray">
  <td class="pv2 ph3 b">${key}</td>
  <td class="pv2 ph3">${value}</td>
</tr>
`
}

module.exports = render

if (require.main === module) {
  test()
}

function test () {
  console.log(render({
    jobId: 42
  }, require('../test/result.json')))
}
