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

const rtspPlayer = require('./playrtsp')
const MPlayer = require('mplayer')

module.exports.setTrigger = function (src) {
  src.on('on', () => {
    const player = new MPlayer()
    player.on('start', console.log.bind(this, 'playback started'))
    player.on('stop', console.log.bind(this, 'playback stoped'))
    player.on('status', console.log)
    player.openFile('./data/ding_dong_bell_door.mp3')

    rtspPlayer.toggle()
  })
}
