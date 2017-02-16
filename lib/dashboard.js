'use strict'

const html = require('bel')
const template = require('./template')

function render (data) {
  return template('Dashboard', body.bind(null, data))
}

function body (data) {
  const columns = computeColumns(data)

  return html`
<div class="fl w-100 pa4">
  <table class="collapse ba br2 b--black-10 pv2 ph3 fl">
    <tr class="striped--light-gray">
      <th class="pv2 ph3">Job</th>
      ${columns.map(function (col) {
        return html`
      <th class="pv2 ph3">${col + ' req/s'}</th>
      `
      })}
    </tr>
    ${data.runs.map(function (run) {
      return html`
    <tr class="striped--light-gray">
      <td class="pv2 ph3 tc">
        <a href="${run.path}/index.html">${run.id}</a>
      </td>
      ${columns.map(function (col) {
        const result = getResult(run.results, col)
        if (result) {
          return html`
      <td class="pv2 ph3">${result.requests.mean + ' \u00B1 ' + result.requests.stddev}</td>
          `
        }
      })}
    </tr>
    `
    })}
  </table>
</div>
`
}

function computeColumns (data) {
  const titles = new Set()

  data.runs.forEach(function (run) {
    run.results.forEach(function (result) {
      titles.add(result.title)
    })
  })

  return Array.from(titles)
}

function getResult (results, col) {
  return results.filter(result => result.title === col)[0]
}

module.exports = render

if (require.main === module) {
  test()
}

function test () {
  console.log(render(require('../test/meta.json')))
}
