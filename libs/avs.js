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

const fs = require('fs')
const exec = require('child-process-promise').exec
const request = require('request')
const httpMessageParser = require('http-message-parser')
const BufferList = require('bl')
const MPlayer = require('mplayer')

function playMP3 (filename) {
  console.log(filename)

  if (settings.config.use.local_play !== 1) {
    return
  }

  const player = new MPlayer()
  player.on('start', console.log.bind(this, 'playback started'))
  player.on('stop', console.log.bind(this, 'playback stoped'))
  player.openFile(filename)
}

module.exports.TTS = function (text, filename) {
  const wavPath = settings.data_path + filename
  return exec('/usr/local/bin/pico2wave -w ' + wavPath + ' "' + text + '"')
}

module.exports.sendWav = function (wavFilename) {
  return new Promise((resolve, reject) => {
    const bl = new BufferList()
    const options = {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + settings.data.avs.token
      },
      url: settings.config.avs.speechrecognizer,
      formData: {
        request: {
          value: JSON.stringify({
            messageHeader: {},
            messageBody: {
              profile: 'alexa-close-talk',
              locale: 'en-us',
              format: 'audio/L16; rate=16000; channels=1'
            }
          }),
          options: {
            contentType: 'application/json'
          }
        },
        audio: fs.createReadStream(settings.data_path + wavFilename)
      }
    }

    request(options, (error, response, body) => {
      if (error) {
        console.log('request failed:', error)
        reject(error)
        return
      }

      const parsed = httpMessageParser(bl.toString('ascii'))

      if (parsed.multipart == null || parsed.multipart.length === 0) {
        console.log('no multipart:', body)
        reject(body)
        return
      }

      let checked = 0
      parsed.multipart.forEach((p) => {
        if (p.headers['Content-Type'] === 'application/json') {
          console.log('info :', JSON.stringify(JSON.parse(p.body), null, 4))
        } else if (p.headers['Content-Type'] === 'audio/mpeg') {
          const start = p.meta.body.byteOffset.start
          const end = p.meta.body.byteOffset.end
          const slicedBody = bl.slice(start + 2, end - 2)
          checked = 1

          fs.writeFile(settings.data_path + 'result.mp3', slicedBody, 'binary',
            (err, written, buffer) => {
              if (err) {
                reject(err)
              } else {
                playMP3(settings.data_path + 'result.mp3')
                resolve('result.mp3')
              }
            }
          )
        }
      })

      if (checked === 0) {
        resolve('response without audio/mpeg')
      }
    }).on('data', (data) => {
      console.log('receiving response from alexa (' + data.length + ' bytes)')
      bl.append(data)
    })
  })
}
