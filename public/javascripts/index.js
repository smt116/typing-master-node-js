$(function() {
  $("input[name='time']").blur(function() {
    var val = parseInt($(this).val(), 10);
    if(val > 240) {
      $(this).val(240);
    } else if(val < 10) {
      $(this).val(15);
    }
  });

  $('td.roomTime').each(function(i, e) {
    var time = parseInt($(e).text(), 10);

    var timeCounter = setInterval(function() {
      var currentTime = new Date().getTime(),
          timeToStart = (time - currentTime) / 1000;

      $(e).text(Math.round(timeToStart, 0) + ' sec');
      if(timeToStart > 10) {
        if(timeToStart <= 15) {
          if($(e).hasClass('btn-primary')) {
            $(e).removeClass('btn-primary');
            $(e).addClass('btn-warning');
          }
        }
      } else {
        if(!$(e).hasClass('disabled')) {
          $(e).parent().find('a').attr('href', '');
          $(e).parent().find('.btn').addClass('disabled');
        }
        if(timeToStart < 0) {
          $(e).text('-');
          clearInterval(timeCounter);
        }
      }
    }, 50);
  });
});
