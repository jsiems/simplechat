# simplechat
A Javascript web chat application

# usage
Your main server file should look like this

```javascript 
var express = require('express');
var app = express();
var path = require('path');
var WebSocketServer = require('ws').Server;
var simplechat = require('*PATH_TO_GET_REPO*/simplechat/server/simplechat');

//*PATH_TO_GIT_REPO* is the path from the main server file to the git repo
app.use('/simplechat', express.static(__dirname + '*PATH_TO_GIT_REPO*/simplechat/client'));

app.get('/simplechat', function(req, res) {
  res.sendFile(path.join(__dirname, '*PATH_TO_GET_REPO*/simplechat/client', 'simplechat.html'));
});

var server = app.listen(80, '192.168.1.131', function() {
  var host = server.address().address;
  var port = server.address().port;

  console.log("example app listening at http://%s:%s", host, port);
});

var wss = new WebSocketServer({server: server});
wss.on('connection', function(ws) {
  if(ws.protocol == 'chat') {
    ginrummy.addClient(ws);
  }
});
```
