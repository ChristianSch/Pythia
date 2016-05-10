var express = require('express'),
    app = express(),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    path = require('path'),
    config = require('./config.js');

app.set('port', (process.env.PORT || 5667));

app.use(express.static(path.join(__dirname, 'public/')));

http.listen(app.get('port'), function() {
  console.log('listening on port ' + app.get('port'));
});
