var parser = require("./parser");
var net = require('net');
var util = require('util');
var ServerResponse = require('./ServerResponse');
var events = require('events');
var IncomingMessage = require('./IncomingMessage');


// status code array
var STATUS_CODES = [];
STATUS_CODES[200] = "OK";
STATUS_CODES[400] = "Bad Request";
STATUS_CODES[404] = "Not Found";
STATUS_CODES[500] = "Internal Server Error";

/*
 * Sends 500 response.
 */
function send500(response){
	response.statusCode = 500;
	var body = "<html><body><h1>Internal Server Error.</h1></body></html>";
	response.setHeader("Content-type","text/html");
	response.setHeader("Content-length",body.length);
	response.write(body);
}


/*
 * creates and returns Http server object. 
 */
function createServer(handler){
	var miniHttpServer = net.createServer(function(socket){
		var partialRequest = "";
		var httpResponse = new ServerResponse(socket);
		socket.setMaxListeners(20);
		socket.on('data',function(data){
		    console.log("req: \n\n");
		    console.log(data.toString());
			try{
				var params = parser.readRequests(data.toString());
			}
			catch(err){
				send500(httpResponse);
				return;
			}
			if(params.partialRequest === null){ //we received full request
				var httpRequest = new IncomingMessage(socket,params);//incoming message object.
				handler(httpRequest,httpResponse);
				partialRequest = "";
			}
			else{
				partialRequest += params.partialRequest;
			}
		});

		});

	return miniHttpServer;

}

exports.STATUS_CODES = STATUS_CODES;
exports.createServer = createServer;