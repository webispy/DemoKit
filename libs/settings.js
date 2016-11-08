'use strict'

const path = require('path')
const fs = require('fs')

const settings = {
  config: require('../config.json'),
  data: {
    avs: {
      token: 'none',
      refresh: 'none'
    },
    akc: {
      usertoken: 'none',
      userid: 'none'
    },
    hue: null
  },
  data_path: path.join(__dirname, '/../public/'),
  Save: function () {
    fs.writeFile('./config.json', JSON.stringify(settings.config, null, 2))
  }
}

module.exports = settings
