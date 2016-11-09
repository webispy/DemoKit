'use strict'

const gpioctrl = require('./gpioctrl')
const settings = require('./settings')

const util = require('util')

const io = require('socket.io')()
const web = io.of('/web')
const slave = io.of('/slave')

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

  data.from = 'master'
  web.emit('log', data)
}

function updateStatus () {
  console.log('- web client count: ', Object.keys(web.sockets).length)
  console.log('- slave client count:', Object.keys(slave.sockets).length)
}

web.on('connection', function (socket) {
  /* Send current status */
  socket.emit('settings', settings)
  if (Object.keys(slave.sockets).length > 0) {
    sendLog('slave already connected:', slave.sockets[Object.keys(slave.sockets)[0]].conn.remoteAddress)
    socket.emit('slave_status', 1)
  } else {
    sendLog('slave not ready')
    socket.emit('slave_status', 0)
  }

  socket.on('disconnect', function () {
    console.log('web-user disconnected: ', socket.id)
    updateStatus()
  })

  /* Events from Webpage */
  socket.on('fakegpio', function (data) {
    /* pass event to slave */
    if (data.to === 'slave') {
      if (slave) {
        slave.emit('fakegpio', data)
        sendLog('emit fakegpio event to slave: ', data)
      } else {
        sendLog('slave not ready: ', data)
      }
      return
    }

    sendLog('receive fakegpio event: ', data)

    let obj = null

    if (data.pin === 'SW403') {
      obj = gpioctrl.LED400
    } else if (data.pin === 'SW404') {
      obj = gpioctrl.LED401
    }

    obj.setStatus(data.status)
  })

  sendLog('web-user connected: ', socket.conn.remoteAddress)
  updateStatus()
})

slave.on('connection', function (socket) {
  socket.on('disconnect', function () {
    sendLog('slave disconnected: ', socket.id)
    updateStatus()
    web.emit('slave_status', 0)
  })

  socket.on('gpio', function (data) {
    if (data.from === 'slave') {
      gpioctrl.RemoteGpio[data.pin].setStatus(data.status)
    }

    web.emit('gpio', data)
  })

  /* Log from slave */
  socket.on('log', function (data) {
    web.emit('log', data)
  })

  socket.on('status', function (data) {
    console.log(data)
    if (data.wemo) {
      settings.data.wemo = data.wemo
    }

    web.emit('settings', settings)
  })

  socket.emit('config', settings.config)
  sendLog('slave connected: ', socket.conn.remoteAddress)
  updateStatus()
  web.emit('slave_status', 1)
})

module.exports.setup = function (server) {
  io.attach(server)

  gpioctrl.LED400.on('on', function () {
    web.emit('gpio', { from: 'master', pin: 'LED400', status: 1 })
  })
  gpioctrl.LED400.on('off', function () {
    web.emit('gpio', { from: 'master', pin: 'LED400', status: 0 })
  })
  gpioctrl.LED401.on('on', function () {
    web.emit('gpio', { from: 'master', pin: 'LED401', status: 1 })
  })
  gpioctrl.LED401.on('off', function () {
    web.emit('gpio', { from: 'master', pin: 'LED401', status: 0 })
  })
}

module.exports.sendLog = sendLog
module.exports.web = web
module.exports.slave = slave
