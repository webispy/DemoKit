
var socket = null
var switchEventDisabled = {
  hue: false,
  wemo: false,
  masterSW403: false
}

$('#switch_hue').bootstrapSwitch({
  onSwitchChange: function (e, s) {
    if (switchEventDisabled.hue === true) {
      return
    }

    var url = ''

    if (s === true) {
      url = '/hue/on'
    } else if (s === false) {
      url = '/hue/off'
    } else {
      return
    }

    $.ajax({ url: url }).fail(function (err) {
      console.log(err)
      $.notify(err.responseText)
    })
  }
})

$('#switch_wemo').bootstrapSwitch({
  onSwitchChange: function (e, s) {
    if (switchEventDisabled.wemo === true) {
      return
    }

    var url = ''

    if (s === true) {
      url = '/wemo/on'
    } else if (s === false) {
      url = '/wemo/off'
    } else {
      return
    }

    $.ajax({ url: url }).fail(function (err) {
      console.log(err)
      $.notify(err.responseText)
    })
  }
})

$('#switch_master_SW403').bootstrapSwitch({
  onSwitchChange: function (e, s) {
    if (switchEventDisabled.masterSW403 === true) {
      return
    }

    if (s === true) {
      socket.emit('fakegpio', { to: 'master', pin: 'SW403', status: 1 })
    } else if (s === false) {
      socket.emit('fakegpio', { to: 'master', pin: 'SW403', status: 0 })
    }
  }
})

function toggleStatus (status, id, offClass, onClass) {
  if (status === 1) {
    $(id).removeClass(offClass)
    $(id).addClass(onClass)
  } else {
    $(id).removeClass(onClass)
    $(id).addClass(offClass)
  }
}

$(function () {
  socket = io('/web')

  socket.on('settings', function (msg) {
    console.log(msg)

    if (msg.data.hue) {
      $('#hue_status').html(msg.data.hue)
    } else {
      $('#hue_status').html('unknown status')
    }

    if (msg.data.wemo) {
      $('#wemo_status').html(msg.data.wemo)
    } else {
      $('#wemo_status').html('unknown status')
    }
  })

  socket.on('gpio', function (data) {
    var styleName

    if (data.pin === 'LED400') {
      styleName = 'list-group-item-danger'
    } else if (data.pin === 'LED401') {
      styleName = 'list-group-item-info'
    }

    toggleStatus(data.status, '#' + data.from + '_' + data.pin, 'list-group-item-default', styleName)

    if (data.pin === 'LED400' && data.from === 'master') {
      var status = false

      if (data.status === 1)
        status = true

      switchEventDisabled.masterSW403 = true
      $('#switch_master_SW403').bootstrapSwitch('state', status)
      switchEventDisabled.masterSW403 = false
    }
  })

  socket.on('slave_status', function (connected) {
    if (connected) {
      $('#fset_slave').prop('disabled', false)
      $('#switch_wemo').bootstrapSwitch('disabled', false)
    } else {
      $('#fset_slave').prop('disabled', true)
      $('#switch_wemo').bootstrapSwitch('disabled', true)
    }
  })

  socket.on('log', function (data) {
    console.log(data)

    var row = $('<tr />')

    row.append($("<td class='col-xs-3 text-center'>" + data.time + '</td>'))
    row.append($("<td class='col-xs-9'>" + data.msg + '</td>'))
    $('#log_' + data.from + ' > tbody > tr:last').after(row)

    var tbody = $('#log_' + data.from + ' > tbody')

    tbody.animate({ scrollTop: tbody.prop('scrollHeight'), scrollLeft: 0 }, 100)
  })
})

$('#btn_master_SW404').on('click', function () {
  socket.emit('fakegpio', { to: 'master', pin: 'SW404', status: 1 })
  socket.emit('fakegpio', { to: 'master', pin: 'SW404', status: 0 })
})

$('#btn_slave_SW403').on('click', function () {
  socket.emit('fakegpio', { to: 'slave', pin: 'SW403', status: 1 })
  socket.emit('fakegpio', { to: 'slave', pin: 'SW403', status: 0 })
})

$('#btn_slave_SW404').on('click', function () {
  socket.emit('fakegpio', { to: 'slave', pin: 'SW404', status: 1 })
  socket.emit('fakegpio', { to: 'slave', pin: 'SW404', status: 0 })
})

$('#btn_avs_say').on('click', function () {
  $('#btn_avs_say').prop('disabled', true)
  $('#btn_avs_say').html('<i class="fa fa-spinner fa-pulse fa-fw"></i> Send')
  $.ajax({ url: '/avs/say?text=' + $('#say_text').val() })
    .done(function (data) {
      var result = JSON.parse(data)
      console.log(result)

      $('#btn_avs_say').prop('disabled', false)
      $('#btn_avs_say').html('Send')
    })
    .fail(function (err) {
      $('#btn_avs_say').prop('disabled', false)
      $('#btn_avs_say').html('Send')

      console.log(err)
      $.notify(err.responseText)
    })
})
