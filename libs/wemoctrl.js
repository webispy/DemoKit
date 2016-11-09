'use strict'

const settings = require('./settings')
const ipc = require('./ipc_slave')
const WeMo = require('wemo')

let client = null
let handle = null

function startSearch() {
  if (client != null) {
    client._stop()
  }

  client = WeMo.Search()
  console.log('Start WeMo search')

  client.on('found', (device) => {
    console.log('wemo found:', device.ip, device.port)
    handle = new WeMo(device.ip, device.port)
    settings.data.wemo = device.ip
    ipc.sendStatus()
  })
}

startSearch()

setInterval(function() {
  if (handle == null) {
    console.log('can't find WeMo in 5 secs. retry WeMo search')
    startSearch()
  }
}, 5000)

module.exports.getStatus = function (cb) {
  if (handle == null) {
    cb(new Error("can't find wemo"))
    return
  }

  handle.getBinaryState((err, result) => {
    if (err) {
      cb(err)
      return
    }

    cb(null, result)
  })
}

module.exports.setOn = function (cb) {
  if (handle == null) {
    cb(new Error("can't find wemo"))
    return
  }

  handle.setBinaryState(1, (err, result) => {
    if (err) {
      cb(err)
      return
    }

    cb(null, result)
  })
}

module.exports.setOff = function (cb) {
  if (handle == null) {
    cb(new Error("can't find wemo"))
    return
  }

  handle.setBinaryState(0, (err, result) => {
    if (err) {
      cb(err)
      return
    }

    cb(null, result)
  })
}
