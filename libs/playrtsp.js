'use strict'

const spawn = require('child_process').spawn
const ipc = require('./ipc_server')
const list = new Map()

let iter = list.entries()
let camplayer = null

list.set('webcam', 'rtsp://admin:1234@192.168.0.30/profile4/media.smp')

function start (url) {
  if (camplayer) {
    console.log('already started')
    return
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
