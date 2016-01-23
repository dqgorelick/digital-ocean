var client = io();
client.on('onconnected', function(data) {
    console.log("Your username is " + data.id)
    console.log("Your are a " + data.state)
})
// user.on('chat message', function(msg){
//     $('#messages').append($('<li>').text(msg));
//   });
