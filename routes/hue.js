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

const settings = require('../libs/settings')
const ipc = require('../libs/ipc_server')
const hue = require('../libs/huectrl')

const express = require('express')

const router = express.Router()

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
    } else {
      res.end()
    }
  })
})

router.get('/off', (req, res) => {
  hue.setOff((err, result) => {
    if (err) {
      ipc.sendLog(err.toString())
      res.status(500).send(err.toString())
    } else {
      res.end()
    }
  })
})

module.exports = router
