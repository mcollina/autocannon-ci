'use strict'

const html = require('bel')
const doc = '<!DOCTYPE html>'
const pack = require('../package')

function template (title, styles, func) {
  if (typeof styles === 'function') {
    func = styles
    styles = 'bg-white dark-gray'
  }
  return doc + html`
<html lang="en">
  <title>${title}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/tachyons/css/tachyons.min.css">
  <body class="${styles} pa4 sans-serif">
    <div class="fl w-100 bb db bw2">
      <h1 class="fl w-80">${title}</h2>
      <a href="${pack.homepage}" target="_blank" class="fl w-20">
        <img class="mw-20" src="https://github.com/mcollina/autocannon/raw/master/autocannon-logo-hire.png">
      </a>
    </div>
    ${func()}
  </body>
</html>
`
}

module.exports = template
