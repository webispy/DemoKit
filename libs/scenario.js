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

const gpioctrl = require('./gpioctrl')
const dingdong = require('./dingdong')
const micRecorder = require('./micrecorder')
const rtspPlayer = require('./playrtsp')
const hue = require('./huectrl')

function linkSwitchToLED () {
  gpioctrl.SW403.on('pressed', () => gpioctrl.LED400.setOn())
  gpioctrl.SW403.on('released', () => gpioctrl.LED400.setOff())
  gpioctrl.SW404.on('pressed', () => gpioctrl.LED401.setOn())
  gpioctrl.SW404.on('released', () => gpioctrl.LED401.setOff())
}

module.exports.setupMaster = function () {
  const ipc = require('./ipc_server')

  linkSwitchToLED()

  /* Event from Real GPIO source */
  gpioctrl.LED400.on('on', () => ipc.emitGpioEvent('LED400', 1))
  gpioctrl.LED400.on('off', () => ipc.emitGpioEvent('LED400', 0))
  gpioctrl.LED401.on('on', () => ipc.emitGpioEvent('LED401', 1))
  gpioctrl.LED401.on('off', () => ipc.emitGpioEvent('LED401', 0))

  /* Event from Webpage(Fake GPIO) */
  ipc.setFakeGpioHandler({
    SW403: function (status) {
      gpioctrl.LED400.setStatus(status)
    },
    SW404: function (status) {
      gpioctrl.LED401.setStatus(status)
    }
  })

  /* Event from Slave node */
  ipc.setSlaveGpioHandler({
    LED400: function (status) {
      gpioctrl.SlaveGpio.LED400.setStatus(status)
    },
    LED401: function (status) {
      gpioctrl.SlaveGpio.LED401.setStatus(status)
    }
  })

  micRecorder.setTrigger(gpioctrl.LED400)

  rtspPlayer.setTrigger(gpioctrl.LED401)

  dingdong.setTrigger(gpioctrl.SlaveGpio.LED400)
  hue.setTrigger(gpioctrl.SlaveGpio.LED400)
}

module.exports.setupSlave = function () {
  const ipc = require('./ipc_slave')

  linkSwitchToLED()

  /* Event from Real GPIO source */
  gpioctrl.LED400.on('on', () => ipc.emitGpioEvent('LED400', 1))
  gpioctrl.LED400.on('off', () => ipc.emitGpioEvent('LED400', 0))
  gpioctrl.LED401.on('on', () => ipc.emitGpioEvent('LED401', 1))
  gpioctrl.LED401.on('off', () => ipc.emitGpioEvent('LED401', 0))

  /* Event from Webpage(Fake GPIO) */
  ipc.setFakeGpioHandler({
    SW403: function (status) {
      gpioctrl.LED400.setStatus(status)
    },
    SW404: function (status) {
      gpioctrl.LED401.setStatus(status)
    }
  })
}
