

/*
 * constructor for the IncomingMessage object from the HTTP module 
 */
function IncomingMessage(socket,params){ //remove the arr from params.
	this.params = params;
	this.body = params.body;
	this.httpVersion = params.version;
	this.headers = "{";
	var keys = Object.keys(params.headers);
	
	for(var i = 0; i < keys.length - 1; i++){
		this.headers += keys[i] + ": " + params.headers[keys[i]] + ",\n";
	}
	this.headers += keys[keys.length - 1] + ": " + params.headers[keys.length - 1] + "}";
	this.setTimeout = function setTimeout(msecs,callback){
		this.socket.setTimeout(msecs,callback);
	};
	this.method = params.method;
	this.url = params.resource;
	this.statusCode = 0; //obtained only from http client request.
	this.socket = socket;
	return this;
}

module.exports = IncomingMessage;