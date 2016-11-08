'use strict'

const ipc = require('../libs/ipc_server')

const express = require('express')
const router = express.Router()

router.get('/on', (req, res) => {
  ipc.slave.emit('wemoctrl', { cmd: 'setOn' })
  res.end()
})

router.get('/off', (req, res) => {
  ipc.slave.emit('wemoctrl', { cmd: 'setOff' })
  res.end()
})

module.exports = router
