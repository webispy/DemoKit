'use strict'

const settings = require('./libs/settings')
const ipc = require('./libs/ipc_slave')
const wemo = require('./libs/wemoctrl')
const spawn = require('child_process').spawn
const akcdata = require('./libs/akcdatactrl')

const akcWemo = new akcdata.MQTT(settings.config.artikcloud.devices.wemo)

const mdns = require('mdns')
const browser = mdns.createBrowser(
  mdns.tcp('https'), {
    resolverSequence: [
      mdns.rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }), mdns.rst.makeAddressesUnique()
    ]
  }
)

const rtspservice = {
  command: '/usr/local/bin/test-launch',
  args: [
    '( v4l2src device=/dev/video6 ! video/x-raw,format=I420,framerate=15/1,width=1280,height=720 ! nxvideoenc ! rtph264pay name=pay0 )',
    '-p',
    '8554'
  ],
  child: null
}

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

ipc.setup()
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

akcWemo.on('connect', function () {
  ipc.sendLog('WeMo proxy for ARTIK Cloud connected (MQTT)')
})

akcWemo.on('actions', function (data) {
  ipc.sendLog('WeMo proxy action received from ARTIK Cloud: ', data)
  if (data.actions == null || data.actions.length === 0) {
    return
  }

  const cmd = data.actions[0].name
  if (cmd === 'setOn') {
    wemo.setOn(function (err, result) {
      if (err) {
        ipc.sendLog(err)
      } else {
        ipc.sendLog('WeMo on: ', result)
      }
    })
  } else if (cmd === 'setOff') {
    wemo.setOff(function (err, result) {
      if (err) {
        ipc.sendLog(err)
      } else {
        ipc.sendLog('WeMo off: ', result)
      }
    })
  } else {
    ipc.sendLog('invalid action name')
  }
})

rtspservice.child = spawn(rtspservice.command, rtspservice.args)
rtspservice.child.on('close', function (code, signal) {
  ipc.sendLog('closed:', code, signal)
})
rtspservice.child.on('error', function (err) {
  ipc.sendLog(err)
})
