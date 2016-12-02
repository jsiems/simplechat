var nextId = 1;
var rooms = {};

module.exports = {
  addClient: function(ws) {
    ws.id = nextId;
    nextId ++;

    //handles each time the server receives a message from the ws
    ws.on('message', function(message) {
      var data = JSON.parse(message);

      if(data.action == "connect") {
        if(rooms[data.room] == undefined) {
          rooms[data.room] = new Room(data.room);
        }
        ws.username = data.username;
        ws.room = data.room;
        rooms[data.room].connect(ws);
      }
      if(data.action == "send_message") {
        var response = {};
        response.username = data.username;
        response.message = data.message;
        rooms[data.room].sendMessage(JSON.stringify(response));
      }
    });

    ws.on('close', function(){
      for(var key in rooms) {
        if(rooms.hasOwnProperty(key))  {
          if(rooms[key].getName() == ws.room) {
            rooms[key].disconnect(ws);
            if(rooms[key].getUserCount() == 0) {
              rooms[key] = null;
              delete rooms[key];
            }
            break;
          }
        }
      }
    });
  }
}

function Room(nameInput) {
  var users = 0;
  var name = nameInput;
  var websockets = {};

  this.getName = function() {return name};
  this.getUserCount = function() {return users};

  this.connect = function(ws) {
    websockets[ws.id] = ws;
    var data = {};
    data.username = "server";
    data.message = ws.username + " has connected";
    this.sendMessage(JSON.stringify(data));
    users ++;
  }

  this.disconnect = function(ws) {
    websockets[ws.id] = null;
    delete websockets[ws.id];
    var data = {};
    data.username = "server";
    data.message = ws.username + " has disconnected";
    this.sendMessage(JSON.stringify(data));
    users --;
  }

  this.sendMessage = function(data) {
    for(var key in websockets) {
      if(websockets.hasOwnProperty(key)) {
        websockets[key].send(data);
      }
    }
  }
}
