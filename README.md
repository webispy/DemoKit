[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# DemoKit

ARTIK Cloud API and ARTIK module connectivity test

## Getting Started

### Prerequisites

#### Hardware
- ARTIK 710 * 2 (Master and Slave)
- WeMo switch
- Hue bridge + Hue lamp
- ipTime A3004NS-d (support Android phone usb tethering)
- Bluetooth Speaker
- Samsung Smartcam

#### Software - Initial setup
- Install dependency packages to each ARTIK 710 boards
```sh
dnf update
dnf install git alsa-lib-devel npm gstreamer1-rtsp-server avahi-devel avahi-compat-libdns_sd-devel
```

- Install RTSP server program
```sh
dnf install autoconf automake m4 libtool gtk-doc glib2-devel gstreamer1-devel gstreamer1-plugins-base-devel
git clone https://github.com/GStreamer/gst-rtsp-server.git
cd gst-rtsp-server
git checkout 1.8
./autogen.sh
./configure --enable-examples
make
cd examples
libtool --mode=install install test-launch /usr/local/bin/
```

- Install TTS program (SVOX pico2wave)
```sh
[ubuntu-host]# apt-get source libttspico-utils
[ubuntu-host]# scp -r svox-1.0+git20130326/pico {your-710-board}
```
```sh
chmod +x autogen.sh
dnf install autoconf automake libtool popt-devel
./autogen.sh
./configure
make
make install
```

#### Environment configuration

##### 710 board(master) IP settings

* Static MAC address setup guide (u-boot)
```sh
Serial console
Press 'Enter' key before start linux kernel
ARTIK710 # run factory_load
ARTIK710 # factory_info list
ARTIK710 # factory_info write ethaddr <your mac address>  e.g.) 00:11:58:23:12:54
ARTIK710 # run factory_save
ARTIK710 # reset
```

* Static IP setup: 192.168.0.10

  1. Open the ipTime admin webpage (http://192.168.0.1)
  1. Setup static IP address using MAC address

##### BT pairing with 710 board(master)
```sh
bluetoothctl
[bluetooth]# scan on
[NEW] Device XX:XX:XX:XX:XX:XX Logitech X100
[bluetooth]# pair XX:XX:XX:XX:XX:XX
[bluetooth]# connect XX:XX:XX:XX:XX:XX
[bluetooth]# exit

pactl list cards
pactl set-card-profile 1 a2dp_sink
```

##### ipTime setup

1. Open the ipTime admin webpage (http://192.168.0.1)
1. Login (default id/password = 'admin' / 'admin')
1. Enable the USB tethering option

##### WeMo switch setup

1. Install WeMo app on your smartphone
1. Connect to WeMo wifi
1. ...

##### Hue bridge setup

1. Install Hue app on your smartphone
1. Add Hue Bridge on Hue app
1. Add bulb

##### Samsung Smartcamera

1. https://www.samsungsmartcam.com/
1. Register your account
1. Register the camera and Setup id/password to 'admin' / '1234'

### Installing

```sh
git clone http://github.com/...
cd demokit
npm install

npm install -g forever forever-service

# Master board (indoor simulation)
forever-service install master --script bin/www
service master start

# Slave board (front door simulation)
forever-service install slave --script slave.js
service slave start

reboot
```
### Patch

demokit/node_modules/mdns/lib/resolver_sequence_tasks.js
```javascript
        try {
-          //var error = dns_sd.buildException(errorCode);
+          var error = null;
          if ( ! error && service.interfaceIndex === iface) {
```

## Link the Alexa, ARTIK Cloud and Devices to DemoKit

### Setup Alexa Voice Service & ARTIK Cloud device token
- Open https://192.168.0.10:9745 url using web browser(chrome)
- Click 'Setup' page
- Fill your AVS information to the client-id, client-secret field and 'Save'
- Fill your ARTIK Cloud application information to the client-client-secret field and 'Save'
- Click 'Get user tokens'
- Click 'Get device tokens' and 'Save'

### Setup Hue bridge
- Press 'link button' on the Hue bridge
- Click 'Get registered username' and 'Save'

## Using the DemoKit

### Scenario #1

- Dingdong --> Press MIC btn --> say 'ask artik to open the door' --> Release MIC btn

### Scenario #2

- ...

## Open-source libraries/project used

### Web
- [Bootstrap](http://getbootstrap.com/) - Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.
- [Bootstrap Switch](http://www.bootstrap-switch.org/)
- [jQuery](https://jquery.com/) - jQuery is a fast, small, and feature-rich JavaScript library.
- [Notify.js](https://notifyjs.com/) - Notify.js is a jQuery plugin to provide simple yet fully customisable notifications.
- [socket.io](http://socket.io/) - Socket.IO enables real-time bidirectional event-based communication.
- [Font Awesome](http://fontawesome.io/) - The iconic font and CSS toolkit.

### Node.js
- [Express](http://expressjs.com/): [body-parser](https://www.npmjs.com/package/body-parser), [cookie-parser](https://www.npmjs.com/package/cookie-parser), [debug](https://www.npmjs.com/package/debug), [ejs](https://www.npmjs.com/package/ejs), [express](https://www.npmjs.com/package/express), [morgan](https://www.npmjs.com/package/morgan), [serve-favicon](https://www.npmjs.com/package/serve-favicon)
- [bl](https://www.npmjs.com/package/bl) - Buffer List: collect buffers and access with a standard readable Buffer interface, streamable too!
- [child-process-promise](https://www.npmjs.com/package/child-process-promise) - Simple wrapper around the "child_process" module that makes use of promises
- [http-message-parser](https://www.npmjs.com/package/http-message-parser) - HTTP message parser in JavaScript.
- [mdns](https://www.npmjs.com/package/mdns) - multicast DNS service discovery
- [mplayer](https://www.npmjs.com/package/mplayer) - Node.js wrapper for mplayer
- [mqtt](https://www.npmjs.com/package/mqtt) - MQTT.js is a client library for the MQTT protocol, written in JavaScript for node.js and the browser.
- [node-hue-api](https://www.npmjs.com/package/node-hue-api) - Phillips Hue API Library for Node.js
- [node-microphone](https://www.npmjs.com/package/node-microphone) - Allows Microphone access in node with arecord (Linux) and sox (Windows/OSX).
- [onoff](https://www.npmjs.com/package/onoff) - GPIO access and interrupt detection with JavaScript
- [passport](https://www.npmjs.com/package/passport) - Simple, unobtrusive authentication for Node.js.
- [passport-artikcloud](https://www.npmjs.com/package/passport-artikcloud) - ARTIK Cloud authentication strategy for Passport.
- [passport-oauth2](https://www.npmjs.com/package/passport-oauth2) - OAuth 2.0 authentication strategy for Passport.
- [passport-oauth2-refresh](https://www.npmjs.com/package/passport-oauth2-refresh) - A passport.js add-on to provide automatic OAuth 2.0 token refreshing.
- [request](https://www.npmjs.com/package/request) - Simplified HTTP request client.
- [socket.io](https://www.npmjs.com/package/socket.io) - node.js realtime framework server
- [socket.io-client](https://www.npmjs.com/package/socket.io-client) - Realtime application framework (client)
- [websocket](https://www.npmjs.com/package/websocket) - Websocket Client & Server Library implementing the WebSocket protocol as specified in RFC 6455.
- [wemo](https://www.npmjs.com/package/wemo) - WeMo client

### Utils
- [RTSP server based on GStreamer](https://github.com/GStreamer/gst-rtsp-server)
- [SVOX TTS](http://packages.ubuntu.com/xenial/libttspico-utils)

### Etc
- [freeSFX](http://www.freesfx.co.uk/) - [Ding Dong Bell Door sound](http://www.freesfx.co.uk/download/?type=mp3&id=16513)

## License and Copyright

This project is licensed under the Apache-2.0 License - see the [LICENSE](LICENSE) file for details

Copyright (c) 2016 Samsung Electronics Co., Ltd.
