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

const https = require('https')
const url = require('url')

const api = function (apiURL, token) {
  return new Promise((resolve, reject) => {
    const opts = url.parse(apiURL)
    opts.headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + token
    }

    https.get(opts, (res) => {
      const tmp = []
      res.on('data', (chunk) => tmp.push(chunk))
      res.on('end', () => {
        if (res.statusCode < 200 || res.statusCode > 299) {
          console.log('error: statusCode: ', res.statusCode)
          reject(new Error(JSON.parse(tmp.join('')).error.message + ' (status code: ' + res.statusCode + ')'))
        } else {
          console.log('done:', tmp)
          resolve(JSON.parse(tmp.join('')))
        }
      })
    }).on('error', (err) => {
      console.log('error: ', err)
      reject(err)
    })
  })
}

module.exports.getUserDevices = function (userToken, userId) {
  return api('https://api.artik.cloud/v1.1/users/' + userId + '/devices', userToken)
}

module.exports.getDeviceToken = function (userToken, did) {
  console.log('get device token - id=' + did)
  return api('https://api.artik.cloud/v1.1/devices/' + did + '/tokens', userToken)
}
