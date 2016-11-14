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

const util = require('util')
const EventEmitter = require('events')
const mqtt = require('mqtt')
const WSClient = require('websocket').client
const request = require('request')

/**
 * ARTIK Cloud MQTT
 *
 * Events
 * - 'connect': function()
 * - 'actions' : function(data)
 *   : data => JSON Object for actions
 *     e.g. [ { name: "setOn", parameters: {} }, {..} ]
 *
 * Methods
 * - sendMessage(message [, callback])
 *   : message => JSON Object for message
 *     e.g. { state: 'on' }
 *
 */
function akcMQTT (dev) {
  EventEmitter.call(this)

  const self = this

  this.did = dev.did
  this.token = dev.token
  this.client = mqtt.connect('mqtts://' + this.did + ':' + this.token + '@api.artik.cloud')

  this.client.on('connect', function () {
    self.client.subscribe('/v1.1/actions/' + self.did)
    self.emit('connect')
  })

  this.client.on('message', function (topic, message) {
    self.emit('actions', JSON.parse(message.toString()))
  })

  this.client.on('error', function (err) {
    console.log(err)
    self.emit('error', err)
  })
}

util.inherits(akcMQTT, EventEmitter)

akcMQTT.prototype.sendMessage = function (jsonmsg, done) {
  this.client.publish('/v1.1/messages/' + this.did, JSON.stringify(jsonmsg), done)
}

module.exports.MQTT = akcMQTT

/**
 * ARTIK Cloud REST
 *
 * Methods
 * - getLastMessage(callback(data) {})
 *   : data => JSON Object
 *       data: payload
 *       ts: timestamp from source
 *       cts: timestamp from ARTIK Cloud
 *       sdtid: source device type id
 *       sdid: source device id
 *       uid: user id
 *       mv: manifest version
 *
 * - getLastAction(callback(data) {})
 *   : data => JSON Object
 *   : since 1 week (7 days) ago
 *
 * - sendMessage(data [, callback])
 *   : data => payload(JSON Object for message)
 *
 * - sendAction(data [, callback])
 *   : data => JSON Object for action
 *     e.g. { name: "setOn", parameters: {} }
 *
 */
function akcREST (dev) {
  this.did = dev.did
  this.token = dev.token
}

akcREST.prototype.getLastMessage = function (done) {
  request({
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + this.token
    },
    url: 'https://api.artik.cloud/v1.1/messages/last?count=1&sdids=' + this.did
  }, function (error, response, body) {
    done(error, JSON.parse(body).data[0])
  })
}

akcREST.prototype.getLastAction = function (done) {
  const endDate = Date.now()
  const startDate = endDate - 7 * 24 * 3600 * 1000 /* 1 week */

  request({
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ' + this.token
    },
    url: 'https://api.artik.cloud/v1.1/actions?count=1&endDate=' + endDate + '&startDate=' + startDate + '&order=desc&ddid=' + this.did
  }, function (error, response, body) {
    done(error, JSON.parse(body).data[0])
  })
}

akcREST.prototype.sendMessage = function (jsonmsg, done) {
  request({
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + this.token
    },
    url: 'https://api.artik.cloud/v1.1/messages',
    json: { 'sdid': this.did, 'type': 'message', 'data': jsonmsg }
  }, function (error, response, body) {
    done(error, body.data)
  })
}

akcREST.prototype.sendAction = function (jsonaction, done) {
  request({
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + this.token
    },
    url: 'https://api.artik.cloud/v1.1/messages',
    json: { 'ddid': this.did, 'type': 'action', 'data': { 'actions': [jsonaction] } }
  }, function (error, response, body) {
    done(error, body.data)
  })
}

module.exports.REST = akcREST

/**
 * ARTIK Cloud WebSockets
 *
 * Channels
 * - /live: Firehose
 * - /websocket: Device channel
 *
 * Events
 * - 'connect': function()
 * - 'actions' : function(data)
 *   : data => JSON Object for actions
 *     e.g. [ { name: "setOn", parameters: {} }, {..} ]
 * - 'message' : function(data)
 *   : data => JSON Object for message
 *
 * Methods
 * - sendMessage(data [, callback])
 *   : data => payload(JSON Object for message)
 *
 * - sendAction(data [, callback])
 *   : data => JSON Object for action
 *     e.g. { name: "setOn", parameters: {} }
 */
function akcWS (dev, channel, uid) {
  EventEmitter.call(this)

  const self = this

  this.did = dev.did
  this.token = dev.token

  if (channel && (channel === 'live' || channel === '/live')) {
    this.uid = uid
    this.channel = '/live'
    this.opts = this.channel + '?sdids=' + this.did + '&uid=' + this.uid + '&Authorization=bearer+' + this.token
  } else {
    this.channel = '/websocket'
    this.opts = this.channel
  }

  this.con = null
  this.client = new WSClient()

  this.client.on('connect', function (con) {
    self.con = con

    con.on('message', function (message) {
      const obj = JSON.parse(message.utf8Data)

      if (obj.type === 'ping') {
        return
      }

      if (self.channel === '/live') {
        self.emit('message', obj)
      } else {
        if (obj.type === 'action') {
          self.emit('actions', obj)
        }
      }
    })

    if (self.channel === '/websocket') {
      const req = {
        sdid: self.did,
        Authorization: 'bearer ' + self.token,
        type: 'register'
      }

      con.sendUTF(JSON.stringify(req), function (data) {
        self.emit('connect', self.con)
      })
    } else {
      self.emit('connect', con)
    }
  })

  this.client.connect('wss://api.artik.cloud/v1.1' + this.opts)
}

util.inherits(akcWS, EventEmitter)

akcWS.prototype.sendMessage = function (jsonmsg, done) {
  const req = {
    sdid: this.did,
    type: 'message',
    data: jsonmsg
  }

  this.con.sendUTF(JSON.stringify(req), done)
}

akcWS.prototype.sendAction = function (jsonmsg, done) {
  const req = {
    ddid: this.did,
    type: 'action',
    data: { actions: [jsonmsg] }
  }

  this.con.sendUTF(JSON.stringify(req), done)
}

module.exports.WS = akcWS

/**
 * ARTIK Cloud CoAP
 *
 * TODO: 'coaps://coaps-api.artik.cloud'
 */
function akcCOAP (dev) {
  EventEmitter.call(this)
}

util.inherits(akcCOAP, EventEmitter)

module.exports.COAP = akcCOAP
