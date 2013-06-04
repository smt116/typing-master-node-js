/*jshint jquery: true*/

var socket = io.connect();

//console.log('Connecting to socket.io in progress...');
socket.on('connect', function(data) {
  "use strict";
  //console.log('Connected!');

  var session = (function() {
    var regex = new RegExp("id=([^;]+)"),
    sessionFromCookie = regex.exec(document.cookie),
    session = false;

    if(sessionFromCookie !== null) {
      session = unescape(sessionFromCookie[1]);
    }

    return session;
  })();
  socket.emit('auth', session);

  socket.on('setSession', function(id) {
    var expires = new Date();
    expires.setDate(expires.getTime() + (3600 * 1000));
    document.cookie = "id=" + id + "; expires=" + expires.toUTCString();
  });

  //roomId, userTimeToStart and category are defined in view file
  if(userTimeToStart) {
    socket.emit('createRoom', userTimeToStart, category);
  } else {
    socket.emit('joinRoom', roomId);
  }
});

var typingSpeedChecker = (function() {
  "use strict";
  var previousTime = 0,
      diffTime = 0,
      chars = 0,
      words = 0,
      cpm = 0,
      wpm = 0;

  return {
    check: function(keyCode) {
      var currentTime = new Date().getTime();

      if (previousTime !== 0) {
        chars++;
        if(keyCode === 32) {
          words++;
        }
        diffTime += currentTime - previousTime;

        cpm = Math.round(chars / diffTime * 36000, 2);
        wpm = Math.round(words / diffTime * 36000, 2);
      }
      previousTime = currentTime;

      return {
        cpm: cpm,
        wpm: wpm
      };
    },
    stats: function() {
      return {
        cpm: cpm,
        wpm: wpm
      };
    }
  };
});

$(function() {
  "use strict";
  var textField = $("#playText"),
      input = $("#playInput"),
      progressbar = $("#you .progress .bar"),
      wordIndex = 0,
      typingMistakes = 0,
      wordingMistakes = 0,
      block = true,
      splitedWords = null;

  var words = function() {
    if(splitedWords === null) {
      splitedWords = textField.html().split(" ");
    }
    return splitedWords;
  };

  var formatWord = function(index, type, field, array) {
    //FIXME what about typing source code?
    if(index < array.length) {
      array[index] = '<span class="' + type + '">' + array[index].replace(/(<([^>]+)>)/ig, '') + '</span> ';
      field.html(array);
    }
  };

  var progressPercent = function(current, max) {
    return (current / max) * 100;
  };

  var timeChecker = new typingSpeedChecker();

  input.focus();

  input.keyup(function(event) {
    var key = event.keyCode,
        word = $(words()[wordIndex]).text(),
        statusClass = 'text-success';

    if(block) {
      input.val('');
      return;
    }

    if(key === 32) {
      if(input.val().trim() !== word.trim()) {
        statusClass = 'text-error';
        wordingMistakes++;
        $("#you .wordingMistakes").text(wordingMistakes);
      }
      formatWord(wordIndex++, statusClass, textField, words());

      if(wordIndex === words().length) {
        //FIXME find nicer solution
        $("#playInputArea").hide(500);
        progressbar.parent().removeClass("progress-striped");
      } else {
        formatWord(wordIndex, 'text-info', textField, words());
      }

      progressbar.attr('style', 'width: ' + progressPercent(wordIndex, words().length) + '%');
      input.val('');
    } else {
      var inputVal = input.val().trim(),
          wordVal = word.substring(0, input.val().length).trim();

      if(inputVal !== wordVal) {
        statusClass = 'text-warning';

        if(key !== 8) {
          typingMistakes++;
          $("#you .typingMistakes").text(typingMistakes);
        }
      }
      formatWord(wordIndex, statusClass, textField, words());
    }

    socket.emit('playerStats', {
      socket: socket.id,
      cpm: timeChecker.stats().cpm,
      wpm: timeChecker.stats().wpm,
      wording: wordingMistakes,
      typing: typingMistakes,
      progress: progressPercent(wordIndex, words().length) + '%'
    });
  });

  input.keyup(function(event) {
    if(!block) {
      var values = timeChecker.check(event.keyCode);
      $('#you .cpm').html(values.cpm);
      $('#you .wpm').html(values.wpm);
    }
  });

  socket.on('text', function(room) {
    textField.text(room.text);

    formatWord(0, 'text-info', textField, words());
    for(var i = 1; i < words().length; i++) {
      formatWord(i, 'muted', textField, words());
    }

    var timeCounter = setInterval(function() {
      var currentTime = new Date().getTime(),
          time = (room.time - currentTime) / 1000;

      if(time > 0) {
        $('#timeLeft').text(time);
        if(time <= 10) {
          $('#invite, #inviteHr, #url').hide(500);
          $('#timeLeft').removeClass('label-success');
          $('#timeLeft').addClass('label-warning');
        }
      } else {
        $('#timeLeft').text('GO!');
        block = false;
        timeChecker.check(0);
        clearInterval(timeCounter);
      }
    }, 50);

    if(room._id) {
      $('#url').text('http://' + document.location.hostname + '/play/?room=' + room._id);
      $('#invite').show(500);
    }
  });

  socket.on('playersInRoom', function(data) {
    for(var index in data.players) {
      if(data.players[index] !== data.current.session && data.players[index] !== data.current.socket) {
        $('table tbody').append('<tr id="' + data.players[index] + '"><td>Guest</td><td><div class="progress progress-striped"><div class="bar" style="width:0%"></div><td class="cpm">0</td><td class="wpm">0</td><td class="typingMistakes">0</td><td class="wordingMistakes">0</td></tr>');
      }
    }
  });

  socket.on('playerStatsData', function(data) {
    var tr = $('#' + data.player);
    tr.find(".bar").css("width", data.stats.progress);
    tr.find(".cpm").text(data.stats.cpm);
    tr.find(".wpm").text(data.stats.wpm);
    tr.find(".typingMistakes").text(data.stats.typing);
    tr.find(".wordingMistakes").text(data.stats.wording);
  });

  socket.on('playerStatsInit', function(data) {
    if($('#' + data.player).length === 0) {
      $('table tbody').append('<tr id="' + data.player + '"><td>Guest</td><td><div class="progress progress-striped"><div class="bar" style="width:0%"></div><td class="cpm">0</td><td class="wpm">0</td><td class="typingMistakes">0</td><td class="wordingMistakes">0</td></tr>');
    }
  });
});
