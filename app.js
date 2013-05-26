var express = require('express'),
    less = require('less-middleware'),
    routes = require('./routes'),
    play = require('./routes/play'),
    mongoose = require('mongoose'),
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
  mongoose.connect('mongodb://localhost/typing-master-development');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  mongoose.connect('mongodb://localhost/typing-master-production');
  app.use(express.errorHandler());
});

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

app.get('/play', play.index);
app.get('/', routes.index);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Party listening on port ' + app.get('port'));
});
