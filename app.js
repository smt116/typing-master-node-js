var express = require('express'),
    less = require('less-middleware'),
    routes = require('./routes'),
    play = require('./routes/play'),
    http = require('http'),
    path = require('path');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(less({
    src: __dirname + '/public',
    compress: true
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

app.get('/play', play.index);
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Party listening on port ' + app.get('port'));
});
