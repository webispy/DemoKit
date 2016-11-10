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

const akcdata = require('../libs/akcdatactrl')
const settings = require('../libs/settings')
const ipc = require('../libs/ipc_slave')

const MPlayer = require('mplayer')

const playerProxy = new akcdata.MQTT(settings.config.artikcloud.devices.player)
const playerHandle = new MPlayer()

playerHandle.on('start', () => {
  console.log('player start')
  playerProxy.sendMessage({ state: 'start' }, (err) => {
    if (err) {
      console.log('error:', err)
    }
  })
})

playerHandle.on('stop', () => {
  console.log('player stop')
  playerProxy.sendMessage({ state: 'stop' }, (err) => {
    if (err) {
      console.log('error:', err)
    }
  })
})

playerProxy.on('connect', function () {
  ipc.sendLog('MPlayer proxy for ARTIK Cloud connected (MQTT)')
})

playerProxy.on('actions', function (data) {
  ipc.sendLog('MPlayer proxy action received from ARTIK Cloud: ', data)
  if (data.actions == null || data.actions.length === 0) {
    return
  }

  const cmd = data.actions[0].name
  if (cmd === 'play') {
    ipc.sendLog('play uri: ', data.actions[0].parameters.uri)
    playerHandle.openFile(data.actions[0].parameters.uri)
  } else if (cmd === 'stop') {
    ipc.sendLog('stop')
    playerHandle.stop()
  }
})
