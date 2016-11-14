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
const akc = require('../libs/akcdevicectrl')
const ipc = require('../libs/ipc_server')

const express = require('express')
const passport = require('passport')
const ARTIKCloudStrategy = require('passport-artikcloud')

const router = express.Router()

const strategy = new ARTIKCloudStrategy({
  clientID: settings.config.artikcloud.client_id,
  clientSecret: settings.config.artikcloud.client_secret,
  callbackURL: settings.config.artikcloud.redirect_url
},
  (accessToken, refreshToken, params, profile, done) => {
    console.log('profile = ', profile)
    settings.data.akc.usertoken = accessToken
    settings.data.akc.userid = profile.id
    return done(null, profile)
  }
)

passport.use(strategy)

router.get('/login', passport.authenticate('artikcloud'))

router.get('/callback',
  passport.authenticate('artikcloud', { session: false }),
  (req, res) => {
    res.redirect('/setup')
  })

function reflect (promise) {
  return promise.then(
    function (v) { return { v: v, status: 'resolved' } },
    function (e) { return { e: e, status: 'rejected' } }
  )
}

router.get('/device_lists', (req, res) => {
  console.log('get user devices')
  let devices = []

  akc.getUserDevices(settings.data.akc.usertoken, settings.data.akc.userid)
    .then((result) => {
      let asyncRequests = []

      devices = result.data.devices
      result.data.devices.forEach((d) => {
        asyncRequests.push(akc.getDeviceToken(settings.data.akc.usertoken, d.id))
      })

      ipc.sendLog('device list received: ', result.data.devices.length)
      return Promise.all(asyncRequests.map(reflect))
    })
    .then((result) => {
      result.forEach((token) => {
        if (token.status === 'resolved') {
          devices.forEach((dev) => {
            if (dev.id === token.v.data.did) {
              dev.accessToken = token.v.data.accessToken
            }
          })
        }
      })

      ipc.sendLog('device token received')
      res.end(JSON.stringify({ result: devices }))
    })
    .catch((err) => {
      ipc.sendLog('device_list failed: ', err)
      res.status(500).send(err.toString())
    })
})

router.get('/device_tokens', (req, res) => {
  console.log('get user devices')
  akc.getUserDevices(settings.data.akc.usertoken, settings.data.akc.userid)
    .then((resolve) => {
      let did = ''
      resolve.data.devices.forEach((d) => {
        if (d.dtid === settings.config.artikcloud.devices.wemo.dtid) {
          did = d.id
          settings.config.artikcloud.devices.wemo.did = d.id
          console.log(d)
        }
      })

      return akc.getDeviceToken(settings.data.akc.usertoken, did)
    })
    .then((resolve) => {
      settings.config.artikcloud.devices.wemo.token = resolve.data.accessToken
      console.log(resolve)
      res.end(JSON.stringify({ token: resolve.data.accessToken }))
    })
    .catch((err) => {
      console.log(err)
      res.end(err)
    })
})

router.post('/info', (req, res) => {
  console.log(req.body)
  settings.config.artikcloud.client_id = req.body.client_id
  settings.config.artikcloud.client_secret = req.body.client_secret
  settings.Save()
  res.redirect('/setup')
})

router.post('/device_tokens', (req, res) => {
  console.log(req.body)
  settings.config.artikcloud.devices.wemo.did = req.body.wemo_did
  settings.config.artikcloud.devices.wemo.token = req.body.wemo_token
  settings.config.artikcloud.devices.shell.did = req.body.shell_did
  settings.config.artikcloud.devices.shell.token = req.body.shell_token
  settings.Save()
  res.redirect('/setup')
})

module.exports = router
