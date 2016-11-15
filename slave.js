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

const ipc = require('./libs/ipc_slave')
const wemo = require('./libs/wemoctrl')
const scenario = require('./libs/scenario')

const spawn = require('child_process').spawn

const mdns = require('mdns')
const browser = mdns.createBrowser(
  mdns.tcp('https'), {
    resolverSequence: [
      mdns.rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }), mdns.rst.makeAddressesUnique()
    ]
  }
)

const ad = mdns.createAdvertisement(mdns.tcp('rtsp'), 8554, { name: 'ArtikCam' })
ad.start()

browser.on('serviceUp', function (service) {
  const url = service.type.name + '://' + service.addresses[0] + ':' + service.port
  console.log('MDNS UP:', service.name, url)
  ipc.connect(url)
})

browser.on('serviceDown', function (service) {
  console.log('MDNS DOWN:', service.name)
  ipc.disconnect()
})

browser.start()

scenario.setupSlave()

ipc.setWemoHandler({
  on: function () {
    wemo.setOn(function (err, result) {
      if (err) {
        ipc.sendLog(err)
      } else {
        ipc.sendLog('WeMo on: ', result)
      }
    })
  },
  off: function () {
    wemo.setOff(function (err, result) {
      if (err) {
        ipc.sendLog(err)
      } else {
        ipc.sendLog('WeMo off: ', result)
      }
    })
  }
})

const rtspservice = {
  command: '/usr/local/bin/test-launch',
  args: [
    // '( v4l2src device=/dev/video6 ! video/x-raw,format=I420,framerate=15/1,width=1280,height=720 ! nxvideoenc ! rtph264pay name=pay0 )',
    '(camerasrc camera-crop-width=1280 camera-crop-height=720 framerate=15/1 ! nxvideoenc ! rtph264pay name=pay0 )',
    '-p',
    '8554'
  ],
  child: null
}

rtspservice.child = spawn(rtspservice.command, rtspservice.args)
rtspservice.child.on('close', function (code, signal) {
  ipc.sendLog('closed:', code, signal)
})
rtspservice.child.on('error', function (err) {
  ipc.sendLog(err)
})

require('./proxy/wemo')
