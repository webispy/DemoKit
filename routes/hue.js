'use strict'

const settings = require('../libs/settings')
const ipc = require('../libs/ipc_server')

const express = require('express')
const router = express.Router()

const hue = require('../libs/huectrl')

router.get('/username', (req, res) => {
  console.log('get hue bridge username')
  hue.getUsername((err, result) => {
    if (err) {
      res.status(500).send(err.toString())
    } else {
      res.end(JSON.stringify({ username: result }))
    }
  })
})

router.post('/info', (req, res) => {
  console.log(req.body)
  settings.config.hue.username = req.body.username
  settings.Save()
  res.redirect('/setup')
})

router.get('/on', (req, res) => {
  hue.setOn((err, result) => {
    if (err) {
      ipc.sendLog(err.toString())
      res.status(500).send(err.toString())
    }
    else {
      res.end()
    }
  })
})

router.get('/off', (req, res) => {
  hue.setOff((err, result) => {
    if (err) {
      ipc.sendLog(err.toString())
      res.status(500).send(err.toString())
    }
    else {
      res.end()
    }
  })
})

module.exports = router
