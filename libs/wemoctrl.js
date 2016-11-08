'use strict'

const settings = require('./settings')
const WeMo = require('wemo')
const client = WeMo.Search()

let handle = null

client.on('found', (device) => {
  handle = new WeMo(device.ip, device.port)
  settings.data.wemo = device.ip
})

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
