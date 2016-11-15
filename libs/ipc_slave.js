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
const util = require('util')
const io = require('socket.io-client')

let socket = null
let wemoHandler = null
let fakeGpioHandler = null

function sendLog (args) {
  let msg = ''
  let i = 0

  if (typeof arguments[0] === 'string') {
    msg = arguments[0]
    i = 1
  }

  for (; i < arguments.length; i++) {
    msg += util.inspect(arguments[i])
  }

  const data = {
    time: new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1'),
    msg: msg
  }

  console.log('<sendLog>', msg)

  if (socket) {
    data.from = 'slave'
    socket.emit('log', data)
  }
}

function sendStatus () {
  if (socket) {
    socket.emit('status', { wemo: settings.data.wemo })
  }
}

module.exports.emitGpioEvent = function (pin, status) {
  if (socket == null) {
    return
  }

  socket.emit('gpio', { from: 'slave', pin: pin, status: status })
}

module.exports.connect = function (addr) {
  if (socket) {
    console.log('already connected')
    return
  }

  socket = io.connect(addr + '/slave', { reconnect: true })

  socket.on('connect', () => {
    sendLog('connected to master')
  })

  socket.on('disconnect', () => {
    sendLog('disconnected from master')
  })

  socket.on('fakegpio', (data) => {
    if (fakeGpioHandler == null) {
      sendLog('fakeGpioHandler not ready')
      return
    }

    console.log('fakegpio:', data)
    if (data.to !== 'slave') {
      return
    }

    if (data.pin === 'SW403') {
      fakeGpioHandler.SW403(data.status)
    } else if (data.pin === 'SW404') {
      fakeGpioHandler.SW404(data.status)
    }
  })

  socket.on('wemoctrl', (data) => {
    if (wemoHandler == null) {
      sendLog('wemoHandler not ready')
      return
    }

    if (data.cmd === 'setOn') {
      wemoHandler.on()
    } else if (data.cmd === 'setOff') {
      wemoHandler.off()
    }
  })

  socket.on('config', (data) => {
    console.log('configuration received from master')
    settings.config = data
    settings.Save()
  })

  sendStatus()
}

module.exports.disconnect = function () {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

module.exports.setWemoHandler = function (handler) {
  wemoHandler = handler
}

module.exports.setFakeGpioHandler = function (handler) {
  fakeGpioHandler = handler
}

module.exports.sendStatus = sendStatus

module.exports.sendLog = sendLog
