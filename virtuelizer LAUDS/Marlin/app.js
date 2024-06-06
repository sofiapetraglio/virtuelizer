/**
 * SETUP AND PACKAGES LOAD
 */ 

// serialport to read the Arduino USB port
const { SerialPort } = require("serialport");	// class
const { ReadlineParser } = require("@serialport/parser-readline");	// Binding

// express to generate the website
const express = require('express');
const app = express();

// http to serve the website locally
const http = require("http");
const server = http.createServer(app);

// socket.io to share date between the web page and the local server
const { Server } = require("socket.io");
const io = new Server(server);


/**
 * SERIAL PORT FOR ARDUINO
 */

// create new serial port
const port = new SerialPort({
	path: '/dev/cu.usbmodem144201',	// win: COM3, mac: /dev/cu.usbmodem141201 , ADJUST accordingly
	baudRate: 250000,	// mega 250000, uno 9600
	dataBits: 8,
	stopBits: 1,
	parity: 'none'
});

// on serial port opening
port.on('open', () => {
	console.log('serial port open');
});

// variable to contain the messages coming from the arduino (consider the message up to the end line)
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));


/**
 * LOCAL WEB GENERATOR IN EXPRESS
 */

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});


app.use(express.static('public'));	// necessary to access and serve local files (css, img, js etc requred by the html page)

/**
 * LOCAL WEB SERVER
 */

server.listen(4000, () => {
	console.log('listening on *:4000');
});


/**
 * SOCKET.IO DATA COMMUNICATION BETWEEN WEB PAGE AND LOCAL SERVER
 */

// communication between the web page and the web server
io.on('connection', (socket) => {
	// incoming messages (web page to web server)
	socket.on('greeting-from-client', message => {	
		console.log(message);
	});
	socket.on('gcode', gcode => {
		console.log(gcode);
		// write on the Serial port of the Arduino
		port.write(gcode + '\n');
	});
});

// communication between the arduino and the web server
parser.on('data', data => {
	console.log(data);

	// write the data via socket.io from the web server to the web page
	io.emit('marlin-print', data);
});
