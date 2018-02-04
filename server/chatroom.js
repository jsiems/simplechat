var nextId = 1;
var rooms = {};

module.exports = {
  addClient: function(ws) {
    //there is a better way to do this
    ws.id = nextId;
    nextId ++;

    //handles each time the server receives a message from the ws
    ws.on('message', function(message) {
      var data = JSON.parse(message);

      //a user wants to connect to a room
      if(data.action == "connect") {
        //if a room with this name has not been created, it creates one
        if(rooms[data.room] == undefined) {
          rooms[data.room] = new Room(data.room);
        }
        ws.username = data.username;
        ws.room = data.room;
        rooms[data.room].connect(ws);
      }

      //a user wants to send a message to a room
      //  transmits to EVERYONE in the room (INCLUDING USER THAT SENT IT)
      if(data.action == "send_message") {
        var response = {};
        response.username = data.username;
        response.message = data.message;
        rooms[data.room].sendMessage(JSON.stringify(response));
      }
    });

    //user disconnects
    ws.on('close', function(){
      for(var key in rooms) {
        if(rooms.hasOwnProperty(key))  {
          if(rooms[key].getName() == ws.room) {
            rooms[key].disconnect(ws);

            //if no more members in the room, it is deleted
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

//Room object is created each time a new room is created
//  stores number of users, the name of the room, and 
//  a list of websocket objects that are connected to this room
function Room(nameInput) {
  var users = 0;
  var name = nameInput;
  var websockets = {};

  this.getName = function() {return name};
  this.getUserCount = function() {return users};

  //stores the new connection in the array of web sockets
  this.connect = function(ws) {
    websockets[ws.id] = ws;
    var data = {};
    data.username = "server";
    data.message = ws.username + " has connected";
    this.sendMessage(JSON.stringify(data));
    users ++;
  }

  //removes a websocket from the room
  this.disconnect = function(ws) {
    websockets[ws.id] = null;
    delete websockets[ws.id];
    var data = {};
    data.username = "server";
    data.message = ws.username + " has disconnected";
    this.sendMessage(JSON.stringify(data));
    users --;
  }

  //sends a message to every user in the room
  this.sendMessage = function(data) {
    for(var key in websockets) {
      if(websockets.hasOwnProperty(key)) {
        websockets[key].send(data);
      }
    }
  }
}
