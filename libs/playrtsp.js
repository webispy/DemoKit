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

const spawn = require('child_process').spawn
const ipc = require('./ipc_server')
const list = new Map()

let iter = list.entries()
let camplayer = null

function start (url) {
  if (camplayer) {
    console.log('already started')
    return
  }

  if (url === undefined) {
    iter = list.entries()
    let item = iter.next()
    url = item.value[1]
  }

  const args = [ '-e', 'rtspsrc',
    'location=' + url, 'latency=0',
    '!', 'rtph264depay',
    '!', 'h264parse',
    '!', 'nxvideodec', 'buffer-type=0',
    '!', 'videoflip', 'method=3',
    '!', 'nxvideosink', 'dst-x=180', 'dst-y=320'
  ]

  ipc.sendLog('play from ', url)
  camplayer = spawn('gst-launch-1.0', args)
  camplayer.on('error', function (err) {
    console.log(err)
  })
  camplayer.on('close', function (code, signal) {
    console.log('closed:', code, signal)
  })
}

function stop () {
  if (camplayer == null) {
    console.log('already stopped')
    return
  }

  camplayer.kill('SIGHUP')
  camplayer = null
}

function toggle () {
  let item = iter.next()
  if (item.done) {
    iter = list.entries()
    item = iter.next()
  }

  if (camplayer) {
    stop()
  }

  start(item.value[1])
}

module.exports.start = start
module.exports.stop = stop
module.exports.toggle = toggle

module.exports.setTrigger = function (src) {
  src.on('on', toggle)
}

module.exports.add = function (name, url) {
  if (list.get(name)) {
    return
  }

  if (name === 'ArtikCam') {
    url += '/test'
  }

  if (name[0] === 'S') {
    let tmp = url.split('//')[1]
    let ip = tmp.split(':')[0]
    url = 'rtsp://admin:1234@' + ip + '/profile4/media.smp'
  }

  list.set(name, url)
  ipc.sendLog('RTSP Server added: ', name, url)
}

module.exports.remove = function (name) {
  if (list.get(name) == null) {
    return
  }

  ipc.sendLog('RTSP Server removed: ', name)
  list.delete(name)
}
