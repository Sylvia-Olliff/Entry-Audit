/* global $, BootstrapDialog, find */
'use strict';

$(document).ready(function () {
  let tries = 0;

  $.fn.scrollView = function () {
    return this.each(function () {
      $('html, body').animate({
        scrollTop: $(this).offset().top - 75
      }, 1000);
    });
  };
  // $(':button').ripples();

  $('#searchText').prop('disabled', true);
  $('#testButton').prop('disabled', true);

  const loadDialog = new BootstrapDialog({
    title: '',
    cssClass: 'loading-dialog',
    message: "<div class='text-center'><img src='images/ajax-loader.gif' width='120px' height='120px' /></div>"
  });

  const errorDialog = new BootstrapDialog({
    title: "<h3 class='text-danger'>Error</h3>",
    type: BootstrapDialog.TYPE_WARNING,
    message: ''
  });

  loadDialog.realize();
  loadDialog.getModalHeader().hide();
  loadDialog.getModalFooter().hide();
  loadDialog.getModalBody().css('background-color', '#579BFB');

  $('#fileNum').focus();

  $(document)
    .ajaxStart(function () {
      loadDialog.open();
    })
    .ajaxStop(function () {
      loadDialog.close();
    });

  $('.pane').hide();
  $('#content').hide();

  $('#fileNum').keydown(function (evt) {
    if (evt.keyCode === 13) {
      $('#scrollInv').html('');
      $('#scrollLin').html('');
      let sendData = {
        broker: $('#office option:selected').val(),
        file: $('#fileNum').val()
      };
      ViewAll(sendData);
    }
  });

  $('#all').on('click', function () {
    $('#scrollInv').html('');
    $('#scrollLin').html('');
    const sendData = {
      broker: $('#office option:selected').val(),
      file: $('#fileNum').val()
    };
    ViewAll(sendData);
  });

  $('#searchGo').on('click', function () {
    const invoice = $('#scrollInv').val();
    const line = $('#scrollLin').val();

    if (line !== '') {
      $('#' + line + '.' + invoice).scrollView();
    } else {
      $('#' + invoice).scrollView();
    }
  });

  function ViewAll (sendData) {
    $.ajax({
      type: 'POST',
      dataType: 'JSON',
      url: 'viewAll',
      data: sendData,
      cache: false,
      success: function (result) {
        if (result.error === 'FILE NOT FOUND') {
          errorDialog.setMessage("<h4 class='text-center'>File not Found! Have you Non-ABI'ed it yet?</h4>");
          errorDialog.open();
        } else if (result.error !== undefined) {
          let errorMsg = '';
          for (let error in result.error) {
            errorMsg += error + ', ';
          }
          errorDialog.setMessage(errorMsg);
          errorDialog.open();
        } else {
          $('#viewAll').html(result.html);
          $('#fileTab').hide();
          $('#invoiceTab').hide();
          $('#viewAll').show();
          $('#content').show();
          $('#searchText').prop('disabled', false);
          $('#testButton').prop('disabled', false);

          $('#testButton').on('click', function (evt) {
            evt.preventDefault();
            let testData = {
              broker: $('#office option:selected').val(),
              file: $('#fileNum').val()
            };
            $.ajax({
              type: 'POST',
              dataType: 'HTML',
              url: 'test',
              data: testData,
              cache: false,
              success: function (response) {
                console.log(response);
                setTimeout(function () {
                  window.location.assign('/EntryAudit/download/' + response);
                }, 750);
              },
              error: function (jqXHR, status, err) {
                console.log('Error');
                console.log(status, err);
              }
            });
          });

          $('#searchText').keydown(function (evt) {
            if (evt.keyCode === 13) {
              find($('#searchText').val());
            }
          });
        }
      },
      error: function (jqXHR, status, err) {
        // if ((status === 'timeout' && tries < 3) || (status === 'error' && tries < 3)) {
        //   tries += 1;
        //   ViewAll(sendData);
        // } else {
          console.log('Error');
          console.log(status, err);
          tries = 0;
        // }
      },
      timeout: 5000
    });
  }
});
