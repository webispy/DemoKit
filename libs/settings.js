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

const path = require('path')
const fs = require('fs')

const settings = {
  config: require('../config.json'),
  data: {
    avs: {
      token: 'none',
      refresh: 'none'
    },
    akc: {
      usertoken: 'none',
      userid: 'none'
    },
    hue: null,
    wemo: null
  },
  data_path: path.join(__dirname, '/../public/'),
  Save: function () {
    fs.writeFile('./config.json', JSON.stringify(settings.config, null, 2))
  }
}

module.exports = settings
