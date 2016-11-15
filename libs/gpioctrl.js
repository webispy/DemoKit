/*
 * Copyright (c) 2016 Samsung Electronics Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict'

const settings = require('./settings')

const EventEmitter = require('events')
const util = require('util')
const fs = require('fs')
const Gpio = require('onoff').Gpio

/**
 * GpioCtrl - GPIO Controller
 *
 * Events
 * - 'pressed' or 'on'
 * - 'released' or 'off'
 *
 * Methods
 * - setOn
 * - setOff
 * - setStatus (status)
 */
function GpioCtrl (pin, isInput) {
  EventEmitter.call(this)

  this.pin = pin
  this.isInput = isInput
  this.handle = null
  this.prev_value = -1

  if (pin === 0) {
    console.log('GPIO pin(virtual) opened')
    return
  }

  try {
    fs.accessSync('/sys/class/gpio/export', fs.F_OK | fs.W_OK)
  } catch (e) {
    console.error('GPIO pin(' + pin + ') open failed')
    return
  }

  if (isInput === true) {
    this.handle = new Gpio(pin, 'in', 'both')

    const self = this

    this.handle.watch((err, value) => {
      if (err) {
        console.log(err)
      }

      if (self.prev_value === value) {
        console.log('ignore invalid input')
        return
      }

      self.prev_value = value

      if (value === 0) {
        self.emit('pressed')
        self.emit('on')
      } else {
        self.emit('released')
        self.emit('off')
      }
    })
  } else {
    this.handle = new Gpio(pin, 'out')
  }
}

util.inherits(GpioCtrl, EventEmitter)

GpioCtrl.prototype.setOn = function () {
  if (this.pin === 0) {
    this.emit('on')
    return
  }

  if (this.handle && this.isInput === false) {
    this.handle.writeSync(1)
    this.emit('on')
  } else {
    console.error('setOn() failed')
  }
}

GpioCtrl.prototype.setOff = function () {
  if (this.pin === 0) {
    this.emit('off')
    return
  }

  if (this.handle && this.isInput === false) {
    this.handle.writeSync(0)
    this.emit('off')
  } else {
    console.error('setOff() failed')
  }
}

GpioCtrl.prototype.setStatus = function (status) {
  if (status === 1) {
    this.setOn()
  } else if (status === 0) {
    this.setOff()
  }
}

/**
 * Available GPIO Controls
 *
 */
let ctrls = {
  SW403: null,
  SW404: null,
  LED400: null,
  LED401: null,

  /**
   * Fake Slave GPIO Controller
   * Only Master-node can control the SlaveGpio
   */
  SlaveGpio: {
    LED400: new GpioCtrl(0),
    LED401: new GpioCtrl(0)
  }
}

if (settings.config.use.virtual_gpio) {
  ctrls.SW403 = new GpioCtrl(0, true)
  ctrls.SW404 = new GpioCtrl(0, true)
  ctrls.LED400 = new GpioCtrl(0, false)
  ctrls.LED401 = new GpioCtrl(0, false)
} else {
  ctrls.SW403 = new GpioCtrl(settings.config.gpio.sw403, true)
  ctrls.SW404 = new GpioCtrl(settings.config.gpio.sw404, true)
  ctrls.LED400 = new GpioCtrl(settings.config.gpio.led400, false)
  ctrls.LED401 = new GpioCtrl(settings.config.gpio.led401, false)
}

/* link each button to led */
/*
ctrls.SW403.on('pressed', function () {
  ctrls.LED400.setOn()
})
ctrls.SW403.on('released', function () {
  ctrls.LED400.setOff()
})

ctrls.SW404.on('pressed', function () {
  ctrls.LED401.setOn()
})
ctrls.SW404.on('released', function () {
  ctrls.LED401.setOff()
})
*/

module.exports = ctrls
