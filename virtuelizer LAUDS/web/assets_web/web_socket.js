// open the socket between the web page and the web server
const socket = io('http://localhost:3000');

// send greetings from web page to web server
socket.emit('client-connect', "Html page active!");

// receive the data from the web server to the web page (based on the specific message 'key', aka: 'data-pot')
socket.on('interface', data => {
  console.log('Interface: ' + data);
});

// function to send the g-code, used by the different buttons
function sendGcode(gcode) {
    // console.log(gcode);
    socket.emit('gcode', gcode);
}