'use strict'

const rtspPlayer = require('./playrtsp')
const MPlayer = require('mplayer')

module.exports.setTrigger = function (src) {
  src.on('on', () => {
    const player = new MPlayer()
    player.on('start', console.log.bind(this, 'playback started'))
    player.on('stop', console.log.bind(this, 'playback stoped'))
    player.openFile('../data/ding_dong_bell_door.mp3')

    rtspPlayer.start()
  })
}
