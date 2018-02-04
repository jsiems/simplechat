var connected = false;
var username = "";
var room = "";
var lines = 0;
var maxLines = 100;

function connect() {
  //declares global websocket that can be used everywhere
  ws = new WebSocket('ws://' + document.location.hostname, 'chat');

  ws.onopen = function() {
    connected = true;
    username = $("#usernameTextarea").val();
    room = $("#roomTextarea").val();
    lines = 0;
    $("#connectDiv").hide();
    $("#connectedDiv").show();
    $("#usernameDiv").html('username: ' + username);
    $("#roomDiv").html('room: ' + room);
    //practice sending other things later

    var data = { action: 'connect', username: username, room: room};
    ws.send(JSON.stringify(data));
  }

  ws.onmessage = function(msg) {
    var message = JSON.parse(msg.data);
    var conversation = $("#messageBox").html();
    lines ++;
    if(lines > maxLines) {
      lines --;
      conversation = conversation.substring(0, conversation.lastIndexOf('<span'));
    }
    $("#messageBox").html("<span"
         + (message.username == 'server' ? " class='server'" : "")
         + (message.username == username ? " class='me'" : "")
         + ">" + message.username + ": "
         + message.message + "</span>" + conversation);
    updateScroll();
  }
}

function sendMessage() {
  if(!connected)
    return;
  var data = {action: 'send_message', username: username, room: room, message: $("#message").val()}
  ws.send(JSON.stringify(data));
  $("#message").val("");
  $("#message").focus();
}

function disconnect() {
  ws.close();
  $("#connectedDiv").hide();
  $("#connectDiv").show();
  $("#messageBox").html("");
}

function updateScroll(mandatory) {
  if($("#messageBox")[0].scrollHeight - $("#messageBox").scrollTop() - $("#messageBox").height() < 200 || mandatory) {
    $("#messageBox").scrollTop($("#messageBox")[0].scrollHeight - $("#messageBox").height());
  }
}
