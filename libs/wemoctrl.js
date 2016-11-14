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
const ipc = require('./ipc_slave')
const sd = require('./slidingdoorctrl')

const WeMo = require('wemo')

let client = null
let handle = null

function startSearch () {
  if (client != null) {
    client._stop()
  }

  client = WeMo.Search()
  console.log('Start WeMo search')

  client.on('found', (device) => {
    console.log('wemo found:', device.ip, device.port)
    handle = new WeMo(device.ip, device.port)
    settings.data.wemo = device.ip
    setOn(() => {
      console.log('wemo setOn completed')
    })
    ipc.sendStatus()
  })
}

function getStatus (cb) {
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

function setOn (cb) {
  if (handle == null) {
    cb(new Error("can't find wemo"))
    return
  }

  console.log('sd down')
  sd.up()
  sd.enable()

  handle.setBinaryState(1, (err, result) => {
    if (err) {
      cb(err)
      return
    }

    cb(null, result)
  })
}

function setOff (cb) {
  if (handle == null) {
    cb(new Error("can't find wemo"))
    return
  }

  handle.setBinaryState(0, (err, result) => {
    if (err) {
      cb(err)
      return
    }

    setTimeout(() => {
      console.log('sd down')
      sd.down()
      sd.enable()
    }, 3000)

    cb(null, result)
  })
}

startSearch()

setInterval(() => {
  if (handle == null) {
    console.log('can not find WeMo in 5 secs. retry WeMo search')
    startSearch()
  }
}, 5000)

module.exports.getStatus = getStatus
module.exports.setOn = setOn
module.exports.setOff = setOff
