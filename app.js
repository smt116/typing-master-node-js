/*jshint node: true */
'use strict';

var express = require('express'),
    less = require('less-middleware'),
    routes = require('./routes'),
    mongoose = require('mongoose'),
    http = require('http'),
    path = require('path');

var app = express();

app.configure(function() {
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(less({
    src: __dirname + '/public',
    compress: true
  }));
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function() {
  mongoose.connect('mongodb://localhost/typing-master-development');
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
  mongoose.connect(process.env.mongohq);
  app.use(express.errorHandler());

  var db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
});

if(process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'typing-master'
  });
}

app.get(/^\/play\/(\.+)?/, routes.play);
app.get('/', routes.index);

var httpServer = http.createServer(app).listen(app.get('port'), function() {
  console.log('Party listening on port ' + app.get('port'));
});

var socketServer = require('./lib/server');
socketServer.listen(httpServer);
