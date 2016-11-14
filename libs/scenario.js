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

const gpioctrl = require('./gpioctrl')
const dingdong = require('./dingdong')
const micRecorder = require('./micrecorder')
const rtspPlayer = require('./playrtsp')
const hue = require('./huectrl')

module.exports.setupMaster = function () {
  micRecorder.setTrigger(gpioctrl.LED400)

  rtspPlayer.setTrigger(gpioctrl.LED401)

  dingdong.setTrigger(gpioctrl.RemoteGpio.LED400)
  hue.setTrigger(gpioctrl.RemoteGpio.LED400)
}
