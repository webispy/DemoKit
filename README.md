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

#### Software
- Install dependency packages to each ARTIK 710 boards
```sh
# dnf update
# dnf install git alsa-lib-devel npm gstreamer1-rtsp-server avahi-devel avahi-compat-libdns_sd-devel
```

- Install RTSP server program
```sh
# dnf install autoconf automake m4 libtool gtk-doc glib2-devel gstreamer1-devel gstreamer1-plugins-base-devel
# git clone https://github.com/GStreamer/gst-rtsp-server.git
# cd gst-rtsp-server
# git checkout 1.8
# ./autogen.sh
# ./configure --enable-examples
# cd examples
# libtool --mode=install install test-launch /usr/local/bin/
# make
```

- Install TTS program (SVOX pico2wave)
```sh
[ubuntu-host]# apt-get source libttspico-utils
[ubuntu-host]# scp -r svox-1.0+git20130326/pico {your-710-board}
# chmod +x autogen.sh
# dnf install autoconf automake libtool popt-devel
# ./autogen.sh
# ./configure
# make
# make install
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
# bluetoothctl
[bluetooth]# scan on
[NEW] Device XX:XX:XX:XX:XX:XX Logitech X100
[bluetooth]# pair XX:XX:XX:XX:XX:XX
[bluetooth]# connect XX:XX:XX:XX:XX:XX
[bluetooth]# exit
# pactl list cards
# pactl set-card-profile 1 a2dp_sink
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

1. ...
1. ...

### Installing

```sh
# git clone http://github.com/...
# cd demokit
# npm install

# npm install -g forever

Master board (indoor simulation)
# forever start bin/www

Slave board (front door simulation)
# forever start slave.js

# reboot
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

## Open-source libraries used
- [Bootstrap](http://getbootstrap.com/) - Bootstrap is the most popular HTML, CSS, and JS framework for developing responsive, mobile first projects on the web.
- [Bootstrap Switch](http://www.bootstrap-switch.org/)
- [jQuery](https://jquery.com/) - jQuery is a fast, small, and feature-rich JavaScript library.
- [Notify.js](https://notifyjs.com/) - Notify.js is a jQuery plugin to provide simple yet fully customisable notifications.
- [socket.io](http://socket.io/) - Socket.IO enables real-time bidirectional event-based communication.
- [Font Awesome](http://fontawesome.io/) - The iconic font and CSS toolkit.
- [RTSP server based on GStreamer](https://github.com/GStreamer/gst-rtsp-server)
- [SVOX TTS](http://packages.ubuntu.com/xenial/libttspico-utils)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE.md) file for details
