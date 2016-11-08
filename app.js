/*
 * DemoKit
 *
 * Copyright (c) 2016 Samsung Electronics Co., Ltd.
 *
 * Licensed under the MIT License
 */
'use strict'

const gpioctrl = require('./libs/gpioctrl')
const settings = require('./libs/settings')

const dingdong = require('./libs/dingdong')
const micRecorder = require('./libs/micrecorder')
const rtspPlayer = require('./libs/playrtsp')
const fs = require('fs')

const express = require('express')
const path = require('path')
const favicon = require('serve-favicon')
const logger = require('morgan')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const passport = require('passport')

const app = express()

const mdns = require('mdns')

const ad = mdns.createAdvertisement(mdns.tcp('https'), 9745, { name: 'DemoKit' })
ad.start()

const browser = mdns.createBrowser(
  mdns.tcp('rtsp'), {
    resolverSequence: [
      mdns.rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo' in mdns.dns_sd ? mdns.rst.DNSServiceGetAddrInfo() : mdns.rst.getaddrinfo({ families: [4] }), mdns.rst.makeAddressesUnique()
    ]
  }
)

browser.on('serviceUp', function (service) {
  const url = service.type.name + '://' + service.addresses[0] + ':' + service.port
  rtspPlayer.add(service.name, url)
})

browser.on('serviceDown', function (service) {
  rtspPlayer.remove(service.name)
})

browser.start()
micRecorder.setTrigger(gpioctrl.LED400)
rtspPlayer.setTrigger(gpioctrl.LED401)
dingdong.setTrigger(gpioctrl.RemoteGpio.LED400)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger('dev'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(passport.initialize())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/avs', require('./routes/avs.js'))
app.use('/akc', require('./routes/akc.js'))
app.use('/hue', require('./routes/hue.js'))
app.use('/wemo', require('./routes/wemo.js'))

app.get('/', function (req, res, next) {
  res.render('index', {
    demokit: settings,
    active_menu: '/'
  })
})

app.get('/setup', function (req, res, next) {
  res.render('setup', {
    demokit: settings,
    active_menu: '/setup'
  })
})

app.get('/tts_result', function (req, res) {
  res.set({ 'Content-Type': 'audio/wav' })
  const readStream = fs.createReadStream(settings.data_path + 'out.wav')
  readStream.pipe(res)
})

app.get('/alexa_result', function (req, res) {
  res.set({ 'Content-Type': 'audio/mpeg' })
  const readStream = fs.createReadStream(settings.data_path + 'result.mp3')
  readStream.pipe(res)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
      message: err.message,
      error: err
    })
  })
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500)
  res.render('error', {
    message: err.message,
    error: {}
  })
})

module.exports = app
