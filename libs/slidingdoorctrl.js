'use strict'

const pwm = require('pwm')

/*
#!/bin/sh

echo 2 > /sys/class/pwm/pwmchip0/export
echo 20000000 > /sys/class/pwm/pwmchip0/pwm2/period
echo 1000000 > /sys/class/pwm/pwmchip0/pwm2/duty_cycle
echo 1 > /sys/class/pwm/pwmchip0/pwm2/enable
*/

let pwm2 = pwm.export(0, 2, function () {
  console.log('pwm ready')
})

pwm2.setPeriod(20000000, function () {
  console.log('setup pwm period')
})

module.export.up = function (cb) {
  pwm2.setDutyCycle(1000000, cb)
}

module.export.down = function (cb) {
  pwm2.setDutyCycle(2000000, cb)
}

module.export.middle = function (cb) {
  pwm2.setDutyCycle(1500000, cb)
}

module.export.enable = function (cb) {
  pwm2.setEnable(1, cb)
}

module.export.disable = function (cb) {
  pwm2.setEnable(0, cb)
}