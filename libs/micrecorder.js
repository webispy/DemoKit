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

const settings = require('./settings')
const avs = require('./avs')

const Mic = require('node-microphone')
const fs = require('fs')

const mic = new Mic({ device: 'default' })

let st = null

module.exports.setTrigger = function (src) {
  src.on('on', function () {
    console.log('start voice recording...')
    st = mic.startRecording()
    st.pipe(fs.createWriteStream(settings.data_path + '/mic_out.wav'))
  })

  src.on('off', function () {
    console.log('stop voice recording...')
    mic.stopRecording()
    st = null

    if (settings.config.use.record_auto_send === 1) {
      console.log('try to send wav to alexa...')
      avs.sendWav('mic_out.wav').then(function (result) {
        console.log('success: ', result)
      }).catch(function (err) {
        console.log('failure: ', err)
      })
    }
  })
}
