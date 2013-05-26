//FIXME ugly code...

$(function() {
  var textField = $("#playText"),
      input = $("#playInput"),
      progressbar = $(".progress .bar"),
      wordIndex = 0,
      typingMistakes = 0,
      wordingMistakes = 0;

  var words = function() {
    if(typeof splited === 'undefined') {
      splited = textField.html().split(" ");
    }
    return splited;
  }

  var formatWord = function(index, type, field, array) {
    //FIXME what about typing source code?
    array[index] = '<span class="' + type + '">' + array[index].replace(/(<([^>]+)>)/ig, '') + '</span> ';
    field.html(array);
  }

  var progressPercent = function(current, max) {
    return (current / max) * 100;
  }

  formatWord(0, 'text-info', textField, words());
  for(var i = 1; i < words().length; i++) {
    formatWord(i, 'muted', textField, words());
  }

  input.focus();

  input.keyup(function(event) {
    //FIXME it should recognize low and upper case
    var key = event.keyCode,
        pressedChar = String.fromCharCode(key).toLowerCase(),
        word = $(words()[wordIndex]).text(),
        statusClass = 'text-success';

    if(key === 32) {
      if(input.val().trim() !== word.trim()) {
        statusClass = 'text-error';
        wordingMistakes++;
        $("#wordingMistakes").text(wordingMistakes);
      }
      formatWord(wordIndex++, statusClass, textField, words());
      formatWord(wordIndex, 'text-info', textField, words());

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
});
