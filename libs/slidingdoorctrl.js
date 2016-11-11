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

const pwm = require('pwm')

/*
#!/bin/sh

echo 2 > /sys/class/pwm/pwmchip0/export
echo 20000000 > /sys/class/pwm/pwmchip0/pwm2/period
echo 1000000 > /sys/class/pwm/pwmchip0/pwm2/duty_cycle
echo 1 > /sys/class/pwm/pwmchip0/pwm2/enable
*/

let pwm2 = pwm.export(0, 2, function () {
  pwm2.setPeriod(20000000, function () {
    console.log('setup pwm period')
  })
})

module.exports.down = function (cb) {
  pwm2.setDutyCycle(1000000, cb)
}

module.exports.up = function (cb) {
  pwm2.setDutyCycle(2000000, cb)
}

module.exports.middle = function (cb) {
  pwm2.setDutyCycle(1500000, cb)
}

module.exports.enable = function (cb) {
  pwm2.setEnable(1, cb)
}

module.exports.disable = function (cb) {
  pwm2.setEnable(0, cb)
}
