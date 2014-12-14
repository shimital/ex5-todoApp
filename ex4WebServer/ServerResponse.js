//response module

var miniHttp = require("./miniHttp");
var events = require('events');
var util = require('util');
/*
 *constructor for the ServerResponse object from the HTTP module 
 */ 
function ServerResponse(socket){
	var implicitHeaders = {};
	this.sock = socket;
	var writeHeadCalled = false;
	var bodySize = 0;
	this.statusCode = 200; //default for now.
	this.setHeader = function(name,value){
		name = name.toLowerCase(); //making the key header case- insensitive
		implicitHeaders[name] = value;
	};
	this.getHeader = function(name){
		name = name.toLowerCase();
		return implicitHeaders[name];
	};
	this.write = function(chunk){
		if(!writeHeadCalled){
			this.writeHead(this.statusCode,implicitHeaders);
		}
		this.sock.write(chunk);
		bodySize += chunk.length;
		if(bodySize >= parseInt(this.getHeader("Content-Length"))){	
			bodySize = 0;
			writeHeadCalled = false;
			implicitHeaders = {};
			this.sock.setTimeout(2000,function(){
				this.end();
			});	
		}
	};
	this.end = function(data){
		if(data === undefined){
			this.sock.end();
		}
		else{
			this.sock.end(data);
		}
		
	};
	this.sendDate = true;

	this.writeHead = function(statusCode,headers){
		var resStr = "HTTP/1.1 " + statusCode + " " + miniHttp.STATUS_CODES[this.statusCode] + "\r\n";
		if(this.sendDate){
			if(!checkIfDateExist(headers)){ //if we don't have the "Date" header, we generate it and add it to response
				resStr += "Date: " + getDate() + "\r\n";
			}
		}
		//joining all headers to the response
		if(headers != undefined){
			var keys = Object.keys(headers);
			for(var i = 0; i < keys.length; i++){
				resStr += keys[i] + ": " + headers[keys[i]] + "\r\n";
			}
		}
		resStr += "\r\n";
		this.sock.write(resStr); 
		this.headersSent = true;
		writeHeadCalled = true;
	};
	this.headersSent = false;
	this.removeHeader = function(name){
		delete implicitHeaders[name];
	};
	this.setTimeout = function(msecs, callback){
		this.sock.setTimeout(msecs, callback);
	}
}

/*
 * returns date in UTC format
 */
function getDate(){
	var date = new Date();
	return date.toUTCString();
}

/*
 * checks if the "Date" header exists among the given headers. returns a boolean value.
 */
function checkIfDateExist(headers){
	var keys = Object.keys(headers); 
	for(var i = 0; i < keys.length; i++){
		var key = keys[i];
		key = key.toLowerCase(); //making all key headers case- insensitive
		if(key === "date"){
			return true;
		}
	}
	return false;

}

module.exports = ServerResponse;