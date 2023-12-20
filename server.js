/**
 * server.js
 * 
 * run in the terminal 'node server.js' to start the connection
 * with the arduino and run the local web page
 *
 */

/**
 * SETUP and packages load
 */ 

// Serialport to read the Arduino USB port
const { SerialPort } = require("serialport");	// class
const { ReadlineParser } = require("@serialport/parser-readline");	// Binding

// express to generate the website
const express = require('express');
const web = express();

// http to serve the website locally
const http = require("http");
const server = http.createServer(web);

// socket.io to share date between the web page and the local server
const { Server } = require("socket.io");
const io = new Server(server);


/**
 * Serial port for the Arduino
 */

// create new serial port
const port = new SerialPort({
	path: '/dev/cu.usbmodem144201',	// win: COM3, mac: /dev/cu.usbmodem144201
	baudRate: 250000,	// mega 250000, uno, 9600
	dataBits: 8,
	stopBits: 1,
	parity: 'none'
});

// on serial port opening
port.on('open', () => {
	console.log('serial port open');
});

// variable to contain the messages coming from the Arduino (consider the message up to the end line)
const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));


/**
 * Local web generator in express
 */

web.get('/', (req, res) => {
	res.sendFile(__dirname + '/virtuelizer.html');    // default page loader
});

web.use(express.static('assets'));	// necessary to access and serve local files (css, img, js etc requred by the html page)

/**
 * Local web server
 */

server.listen(3000, () => {
	console.log('listening on *:3000');
});


/**
 * Socket.io data communication between the web page and the local server
 */

// communication between the web page and the web server
io.on('connection', (socket) => {
	socket.on('gcode', gcode => {
		console.log(gcode);
		// write on the Serial port of the Arduino
        port.write('G91\n');    // incremental advancement
		port.write(gcode + '\n');   // gcode command
	});
	socket.on('client-connect', message => {
		console.log(message);
	});
});

// communication between the Arduino and the web server
parser.on('data', data => {
	console.log('arduino: ', data);

	// write the data via Socket.io from the web server to the web page
	io.emit('arduino', data);
});