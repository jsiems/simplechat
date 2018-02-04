var connected = false;
var username = "";
var room = "";
var lines = 0;
var maxLines = 100;

$(document).ready(function() {
  $(window).resize(function() {
    updateScroll(true);
  });

  $("#message").keyup(function(e){
    var code = e.keyCode ? e.keyCode : e.which;
    if(code == 13) {
      sendMessage();
    }
  });

  $("#connectButton").click(connect);
  $("#disconnectButton").click(disconnect);
  $("#sendMessageButton").click(sendMessage);
});

function connect() {
  //declares global websocket that can be used everywhere
  ws = new WebSocket('ws://' + document.location.hostname, 'chat');

  ws.onopen = function() {
    connected = true;
    username = $("#usernameTextarea").val();
    room = $("#roomTextarea").val();
    lines = 0;
    $("#connectDiv").css("visibility", "hidden");
    $("#connectedDiv").css("visibility", "visible");
    $("#usernameDiv").html('username: ' + username);
    $("#roomDiv").html('room: ' + room);

    var data = { action: 'connect', username: username, room: room};
    ws.send(JSON.stringify(data));
  }

  ws.onmessage = function(msg) {
    //parses the data from the messages
    var message = JSON.parse(msg.data);

    //cuts off the top line of the messages if there are too many
    var conversation = $("#messageBox").html();
    lines ++;
    if(lines > maxLines) {
      lines --;
      conversation = conversation.substring(0, conversation.lastIndexOf('<span'));
    }

    //Puts the message in the HTML with special formatting
    //  if from server - italics
    //  if you posted the message - bold
    $("#messageBox").html("<span"
         + (message.username == 'server' ? " class='server'" : "")
         + (message.username == username ? " class='me'" : "")
         + ">" + message.username + ": "
         + message.message + "</span>" + conversation);
    updateScroll();
  }
}

//transmits a message to the server
function sendMessage() {
  if(!connected)
    return;
  var data = {action: 'send_message', username: username, room: room, message: $("#message").val()}
  ws.send(JSON.stringify(data));
  $("#message").val("");
  $("#message").focus();
}

//Disconnectes the user
function disconnect() {
  ws.close();
  $("#connectedDiv").css("visibility", "hidden");
  $("#connectDiv").css("visibility", "visible");
  $("#messageBox").html("");
}

//scrolls down automatically when messages appear at bottom of box
function updateScroll(mandatory) {
  if($("#messageBox")[0].scrollHeight - $("#messageBox").scrollTop() - $("#messageBox").height() < 200 || mandatory) {
    $("#messageBox").scrollTop($("#messageBox")[0].scrollHeight - $("#messageBox").height());
  }
}
