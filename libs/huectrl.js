'use strict'

const settings = require('./settings')

const EventEmitter = require('events')
const util = require('util')
const Hue = require('node-hue-api')

function updateHueApi (obj) {
  if (obj.ip == null) {
    return
  }

  if (settings.config.hue.username == null) {
    return
  }

  if (obj.api) {
    return
  }

  settings.data.hue = obj.ip
  obj.api = new Hue.HueApi(obj.ip, settings.config.hue.username)
  obj.api.setLightState(1, obj.lightstate.shortAlert(), (err, lights) => {
    console.log(lights)
    cb(err, lights)
  })
}

function HueBridge () {
  EventEmitter.call(this)

  this.ip = null
  this.api = null
  this.lightstate = Hue.lightState.create()
}

util.inherits(HueBridge, EventEmitter)

HueBridge.prototype.Search = function () {
  const self = this

  Hue.nupnpSearch((err, bridge) => {
    if (err) {
      console.log(err)
      self.emit('notfound', null)
      return
    }

    if (bridge.length === 0) {
      console.log("can't find hue bridge")
      self.emit('notfound', null)
      return
    }

    console.log('Hue bridge found: ', bridge)
    self.ip = bridge[0].ipaddress
    self.emit('found', self.ip)
    updateHueApi(self)
  })
}

HueBridge.prototype.getUsername = function (cb) {
  if (this.ip == null) {
    cb(new Error("can't find hue bridge"))
    return
  }

  const self = this

  const api = new Hue.HueApi()
  api.registerUser(this.ip, 'demokit').then((result) => {
    console.log(result)
    cb(null, result)
    updateHueApi(self)
  }).catch((err) => {
    console.log(err)
    cb(err)
  })
}

HueBridge.prototype.setOn = function (cb) {
  if (this.api == null) {
    cb(new Error('not ready'))
    return
  }

  this.api.setLightState(1, this.lightstate.on(), (err, lights) => {
    console.log(lights)
    cb(err, lights)
  })
}

HueBridge.prototype.setOff = function (cb) {
  if (this.api == null) {
    cb(new Error('not ready'))
    return
  }

  this.api.setLightState(1, this.lightstate.off(), (err, lights) => {
    console.log(lights)
    cb(err, lights)
  })
}

HueBridge.prototype.getStatus = function (cb) {
  if (this.api == null) {
    cb(new Error('not ready'))
    return
  }

  this.api.lightStatus(1, (err, result) => {
    console.log(result)
    cb(err, result)
  })
}

const hb = new HueBridge()

hb.on('notfound', function () {
  console.log('retry hue search')
  setTimeout(function () {
    hb.Search()
  }, 1000)
})

hb.Search()

module.exports = hb
