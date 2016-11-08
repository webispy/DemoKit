
function appendToDevices (item) {
  console.log(item)
  var row = $('<tr />')

  var attr = 'did = ' + item.id + '<br/>'
  attr += 'dtid = ' + item.dtid + '<br/>'
  attr += 'token = ' + item.accessToken + '<br/>'

  row.append($("<td class='col-xs-3'>" + item.name + '</td>'))
  row.append($("<td class='col-xs-9'>" + attr + '</td>'))
  $('#devices > tbody > tr:last').after(row)
}

$('#get_device_list_btn').on('click', function () {
  $('#get_device_list_btn').prop('disabled', true)
  $('#get_device_list_btn').html('<i class="fa fa-spinner fa-pulse fa-fw"></i> Get device lists')

  $.ajax({ url: '/akc/device_lists' })
    .done(function (data) {
      var jsonData = JSON.parse(data)
      var tbody = $('#devices > tbody')

      $('#devices > tbody > tr').remove()
      tbody.append('<tr />')
      jsonData.result.forEach(appendToDevices)
      tbody.animate({ scrollTop: tbody.prop('scrollHeight'), scrollLeft: 0 }, 100)

      $('#get_device_list_btn').prop('disabled', false)
      $('#get_device_list_btn').html('Get device lists')
    })
    .fail(function (err) {
      console.log(err)
      $.notify(err.responseText)
      $('#get_device_list_btn').prop('disabled', false)
      $('#get_device_list_btn').html('Get device lists')
    })
})

function get_registered_username () {
  $('#get_registered_username_btn').prop('disabled', true)
  $('#get_registered_username_btn').html('<i class="fa fa-spinner fa-pulse fa-fw"></i> Get registered username')

  $.ajax({ url: '/hue/username' })
    .done(function (data) {
      var result = JSON.parse(data)
      console.log(result)

      $('#hue_username').val(result.username)
      $('#get_registered_username_btn').prop('disabled', false)
      $('#get_registered_username_btn').html('Get registered username')
    })
    .fail(function (err) {
      console.log(err)
      $.notify(err.responseText)
      $('#get_registered_username_btn').prop('disabled', false)
      $('#get_registered_username_btn').html('Get registered username')
    })
}
