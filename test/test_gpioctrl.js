var assert = require('assert')

var GpioCtrl = require('../libs/gpioctrl')

describe('gpioctrl', function () {
  var ctrl = new GpioCtrl(0, true)

  it('setOn with on event', function (done) {
    ctrl.on('on', done)
    ctrl.setOn()
  })

  it('setOff with off event', function (done) {
    ctrl.on('off', done)
    ctrl.setOff()
  })
})
