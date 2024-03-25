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
const installation = express();

// http to serve the website locally
const http = require("http");
const server_web = http.createServer(web);
// const server_installation = http.createServer(installation);

// socket.io to share date between the web page and the local server
const { Server } = require("socket.io");
const io_web = new Server(server_web);


// start the script
main();


// main program start
function main() {

	printInstructions();

	// serial ports index flags
	const marlin_port_index = process.argv.indexOf('--m');	// get the indexes of the flags
	const interface_port_index = process.argv.indexOf('--i');

	// serial ports
	let marlin_port;
	let interface_port;


	if(process.argv.indexOf('-list') > -1) {	// list
		printSerialPorts();
	}
	else if(marlin_port_index > -1 && interface_port_index > -1) {	// marlin and interface port id
		marlin_port = process.argv[marlin_port_index + 1];
		interface_port = process.argv[interface_port_index + 1];
		
		console.log('Ports selected:\n-> Marlin board port id: ' + marlin_port + '\n-> Interface board port id: ' + interface_port);
		
		createSerialPort(marlin_port, interface_port);
	} 
	else {	// command not valid
		console.log('Command not valid! Follow the instruction above to run it properly!');
	}
}

// instructions
function printInstructions() {
	console.log(
		'******************************************************************\n' +
		'How to run this script:\n' +
		'1) Run this command: "npm server -list" to get the list of the serial ports available with the corrisponding [id]\n' +
		'2) Run the script by indicating the correct ports: "npm server --m id --i id"\n' + 
		'   -> where "--m" is the Marlin board, and "--i" is the interface board\n' +
		'   -> (example: "npm server --m 2 --i 4")\n' +
		'******************************************************************\n'
		);
}

// print the list of the serial ports
function printSerialPorts() {
	let index = 0;
	SerialPort.list().then(ports => {
		ports.forEach((item) => {
			console.log('[' + index + '] manufacturer: '  + item.manufacturer + ', path: ' + item.path);
			index++;
		})
    });
}

// create new serial port
function createSerialPort(marlin_port_id, interface_port_id) {


	SerialPort.list().then(ports => {	// marlin_port, baudrate 250000

		if(ports[marlin_port_id] != undefined) {

			if(ports[interface_port_id] != undefined) {

				marlin_port = new SerialPort({	
					path: ports[marlin_port_id].path,
					baudRate: 250000,	// mega 250000, uno, 9600
					dataBits: 8,
					stopBits: 1,
					parity: 'none'
				});

				interface_port = new SerialPort({		// interface_port, baudrate 9600
					path: ports[interface_port_id].path,
					baudRate: 9600,	// mega 250000, uno, 9600
					dataBits: 8,
					stopBits: 1,
					parity: 'none'
				});

				openPorts(marlin_port, interface_port);
			}
			else {
				console.log('\n!!! ERROR: the port of the Ardunio for the Interface doesn`t exist.\n   --> Check it by running "npm server -list" again.\n');
			}
		}

		else {
			console.log('\n!!! ERROR: The port of the Ardunio with Marlin doesn`t exist.\n   --> Check it by running "npm server -list" again.\n');
		}

	});
}

// open serial ports
function openPorts(marlin_port, interface_port) {
	
	marlin_port.on('open', () => {
		console.log("Marlin port open");

		interface_port.on('open', () => {
			console.log("Interface port open");

			runParsers(marlin_port, interface_port);
		});
	});

}

// generate parsers
function runParsers(marlin_port, interface_port) {

	const marlin_parser = marlin_port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

	const interface_parser = interface_port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

	runWeb(marlin_port, interface_parser);
}

function runWeb(marlin_port, interface_parser) {

	console.log("runWb()");

	/**
	 * Local web generator in express of the web platform
	 */

	web.get('/', (req, res) => {
		res.sendFile(__dirname + '/web.html');    // default page loader
	});

	web.use(express.static('assets_web'));	// necessary to access and serve local files (css, img, js etc requred by the html page)

	/**
	 * Local web server
	 */

	server_web.listen(3000, () => {
		console.log('listening on *:3000');
	});


	/**
	 * Socket.io data communication between the web page and the local server
	 */

	// communication between the web page and the web server
	io_web.on('connection', (socket) => {
		socket.on('gcode', gcode => {
			// write on the Serial port of the Arduino
			console.log('G91');
			marlin_port.write('G91\n');    // incremental advancement
			
			console.log(gcode);
			marlin_port.write(gcode + '\n');   // gcode command
		});
		socket.on('client-connect', message => {
			console.log(message);
		});
	});

	// communication between the Arduino and the web server
	interface_parser.on('data', data => {
		//console.log('interface: ', data);

		// write the data via Socket.io from the web server to the web page
		io_web.emit('interface', data);
	});

	/**
	 * Installation server
	 */

	installation.get('/', (req, res) => {
		res.sendFile(__dirname + '/installation.html');    // default page loader
	});

	installation.use(express.static('assets_installation'));	// necessary to access and serve local files (css, img, js etc requred by the html page)

	/**
	 * Local web server
	 */

	installation.listen(4000, () => {
		console.log('listening on *:4000');
	});


}