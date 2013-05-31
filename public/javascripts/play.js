//FIXME ugly code...

var typingSpeedChecker = (function() {
  var previousTime = 0,
      diffTime = 0,
      chars = 0,
      words = 0;

  return {
    check: function(keyCode) {
      var currentTime = new Date().getTime();

      if (previousTime != 0) {
        chars++;
        if(keyCode === 32) words++;
        diffTime += currentTime - previousTime;

        $('#cpm').html(Math.round(chars / diffTime * 6000, 2));
        $('#wpm').html(Math.round(words / diffTime * 6000, 2));
      }
      previousTime = currentTime;
    }
  }
});

$(function() {
  var textField = $("#playText"),
      input = $("#playInput"),
      progressbar = $(".progress .bar"),
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
  }

  var formatWord = function(index, type, field, array) {
    //FIXME what about typing source code?
    if(index < array.length) {
      array[index] = '<span class="' + type + '">' + array[index].replace(/(<([^>]+)>)/ig, '') + '</span> ';
      field.html(array);
    }
  }

  var progressPercent = function(current, max) {
    return (current / max) * 100;
  }

  input.focus();

  input.keyup(function(event) {
    var key = event.keyCode,
        pressedChar = String.fromCharCode(key).toLowerCase(),
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
        $("#wordingMistakes").text(wordingMistakes);
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
          $("#typingMistakes").text(typingMistakes);
        }
      }
      formatWord(wordIndex, statusClass, textField, words());
    }
  });

  var timeChecker = new typingSpeedChecker();
  input.keyup(function(event) {
    if(!block) {
      timeChecker.check(event.keyCode);
    }
  });

  var socket = io.connect();

  console.log('Connecting to socket.io in progress...');
  socket.on('connect', function(data) {
    console.log('Connected!');
  });

  socket.on('text', function(room) {
    textField.text(room.text);

    formatWord(0, 'text-info', textField, words());
    for(var i = 1; i < words().length; i++) {
      formatWord(i, 'muted', textField, words());
    }

    var time = room.time;
    var timeCounter = setInterval(function() {
      var currentTime = new Date().getTime(),
          diff = (room.time - currentTime) / 1000;
      $('#timeLeft').text(diff);
      if(diff <= 5) {
        $('#timeLeft').removeClass('label-success');
        $('#timeLeft').addClass('label-warning');
      }
      if(diff <= 0) {
        $('#timeLeft').text('GO!');
        clearInterval(timeCounter);
        block = false;
      }
    }, 10);
  });
});
