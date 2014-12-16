var rh = require('./responseHandler');
var miniHttp = require('./miniHttp');
var querystring = require('querystring');
var reqHandlers = [];

/*
 * Sends 404 response.
 */
function send404(response){
	response.statusCode = 404;
	var body = "<html><body><h1>File not found.</h1></body></html>";
	response.setHeader("Content-type","text/html");
	response.setHeader("Content-length",body.length);
	response.write(body);
}

/*
 * Checks if the method of the handler can handle the request.
 */
function shouldHandle(method,reqMethod){
	if(method === undefined ||
		method === reqMethod){
			return true;
	}
	return false;
}

/*
 * Returns the app functionality.
 */
var miniExpress = function () {
    console.log("starting to go over middlewares!!!!!!!!!!!!!!!!!!!");
	var app = function(request,response){
		for(var i = 0; i < reqHandlers.length; i++){
			if(match(reqHandlers[i].resourcePre,request.url)){
				if(shouldHandle(reqHandlers[i].method,request.params.method)){
					var res = createRes(response);
					var req = createReq(request,reqHandlers[i].resourcePre);
					var next = function(){
						for(var i = next.i; i < reqHandlers.length; i++){
							if(match(reqHandlers[i].resourcePre,request.url)){
								if(shouldHandle(reqHandlers[i].method,request.params.method)){
									var oldBody = next.req.body;
									var oldCookies = next.req.cookies;
									next.req = createReq(request,reqHandlers[i].resourcePre);
									next.req.body = oldBody;
									next.req.cookies = oldCookies;
									next.i = i + 1;
									reqHandlers[i].handler(next.req,next.res,next);
									return;
								}
							}
						}
						send404(response);
					}
					next.i = i + 1;
					next.req = req;
					next.res = res;
					reqHandlers[i].handler(req,res,next);
					return;
				}
			}
		}
		send404(response);
	};
	
	app.route = {};
	app.use = function(rootResource,func,methodType){
		if(func === undefined){
			func = rootResource; //for clarity.
			reqHandlers.push({resourcePre: "/",handler: func, method:methodType});  
		}
		else{
			reqHandlers.push({resourcePre: rootResource,handler:func, method:methodType});
		}
	};
	app.listen = function(port,func){
		var server = miniHttp.createServer(app);
		return server.listen(port,func);  
	};
	app.get = function(rootResource,func){
		app.use(rootResource,func,"GET");
		if(app.route["get"] === undefined){
			app.route["get"] = [];
		}
		app.route.get.push({path: rootResource,method:"get",callback: func});
	};	
	app.post = function(rootResource,func){
		app.use(rootResource,func,"POST");
		if(app.route["post"] === undefined){
			app.route["post"] = [];
		}
		app.route.post.push({path: rootResource,method:"post",callback: func});

	};
	app.delete = function(rootResource,func){
		app.use(rootResource,func,"DELETE");
		if(app.route["delete"] === undefined){
			app.route["delete"] = [];
		}
		app.route.delete.push({path: rootResource,method:"delete",callback: func});
	};
	app.put = function(rootResource,func){
		app.use(rootResource,func,"PUT");
		if(app.route["put"] === undefined){
			app.route["put"] = [];
		}
		app.route.put.push({path: rootResource,method:"put",callback: func});
	};
	return app;
}

/*
 * Function that returns true if the resource matches the request resource, 
 * returns false otherwise.
 */
function match(resource,reqResource){
	var colonReg = new RegExp(":[a-zA-Z0-9]*","g");
	resource = resource.replace(colonReg,".*");
	var matchReg = new RegExp("^" + resource); // "^" means at the start of the request.
	var isMatch = matchReg.test(reqResource);
	return isMatch;
}

//Returns the req object for the handlers.
function createReq(request,resource){
	var req = {};
	req.body = request.body;
	req.method = request.method;
	req.headers = request.params.headers;
	var reqResource = request.url;
	req.params = createParams(request,resource);
	req.query = createQuery(reqResource);
	req.path = createPath(reqResource);
	req.host = request.params.headers["host"];
	req.protocol = "http";
	req.get = function(field){
		return req.headers[field.toLowerCase()];
	}
	req.param = function(name){
		if(req.params[name] != undefined){
			return req.params[name];
		}
		if(req.body[name] != undefined){
			return req.body[name];
		}
		if(req.query[name] != undefined){
			return req.query[name];
		}
	}
	req.is = function(type){
		if(req.headers["content-type"] != undefined){
			var typeReg = new RegExp(type);
			var isMatch = typeReg.test(req.headers["content-type"]);
			return isMatch;
		}
		else{
			return false;
		}
	}
	return req;
}

/*
 * Creates the path field for the request.
 */
function createPath(reqResource){
	var reqField = reqResource.split("?");
	var pathReg = new RegExp("/.*");
	var path = pathReg.exec(reqField[0])[0];
	return path;
}

/*
 * Returns the params object according
*/
function createParams(request,resource){
	var params = {};
	var requestParts = request.url.split("/");
	var resourceParts = resource.split("/");
	for(var i = 0; i < resourceParts.length; i++){
		if(resourceParts[i].charAt(0) === ":"){
			params[resourceParts[i].substring(1)] = requestParts[i];
		}
	}
	return params;
}






/*
 * Returns the query object according to the query specified in the request.
*/
function createQuery(reqResource){
	var resParts = reqResource.split('?');
	var query = querystring.parse(resParts[1]); //query is object containing the query's.
	var keys = Object.keys(query);
	var cellReg = new RegExp("\\[.*\\]");
	var propertyReg = new RegExp("[a-zA-Z0-9]*");
	var newQuery = {};
	for(var i = 0; i < keys.length; i++){
		if (cellReg.test(keys[i])) {
			var propertyName = propertyReg.exec(keys[i])[0];
			var key = cellReg.exec(keys[i])[0];
			key = key.substring(1,key.length - 1);
			if(newQuery[propertyName] === undefined){
				var subQuery = {};
				subQuery[key] = query[keys[i]];
				newQuery[propertyName] = subQuery;
			}
			else{
				var subQuery = newQuery[propertyName];
				subQuery[key] = query[keys[i]];
				newQuery[propertyName] = subQuery;
			}
		}
		else{
			newQuery[keys[i]] = query[keys[i]];
		}
	}
	return newQuery;
}

/*
 * Returns a function that serves a static request.
 */
miniExpress.static = function(rootFolder){
	return function(req,res,next){
		if(req.method === "GET"){
			rh.createResponse(this.resourcePre,rootFolder,req,res,next);
		}
		else{
			next();
		}
	}
}

/*
 * Returns the cookie parser middleware.
 */
miniExpress.cookieParser = function(){
	return function(req,res,next){
		var cookies = {};
		var cookieField = req.get("Cookie");
		if(cookieField === undefined){
			next();
			return;
		}
		var cookiesArr = cookieField.split(";");
		for(var i = 0; i < cookiesArr.length; i++){
			var cookiePair = cookiesArr[i].split("=");
			cookies[cookiePair[0]] = cookiePair[1];
		}
		req.cookies = cookies;
		next.req = req;
		next.res = res;
		next();
	}

}

/*
 * Returns the json parser middleware.
 */
miniExpress.json = function(){
	return function(req,res,next){
		var contType = req.get("Content-Type");
		if(contType != undefined){
			contType = contType.split(";")[0];
		}
		if(contType === "application/json"){
			req.body = JSON.parse(req.body);
		}
		next.req = req;
		next();
		return req;

	}
}

/*
 * Returns the urlEncoded middleware.
 */
miniExpress.urlencoded = function(){
	return function(req,res,next){
		var contType = req.get("Content-Type");
		if(contType != undefined){
			contType = contType.split(";")[0];
		}
		if(contType === "application/x-www-form-urlencoded"){
			var newBody = querystring.parse(req.body); 
			var keys = Object.keys(newBody);
			var cellReg = new RegExp("\\[.*\\]");
			var propertyReg = new RegExp("[a-zA-Z0-9]*");
			var body = {};
			for(var i = 0; i < keys.length; i++){
				if (cellReg.test(keys[i])) {
					var propertyName = propertyReg.exec(keys[i])[0];
					var key = cellReg.exec(keys[i])[0];
					key = key.substring(1,key.length - 1);
					if(body[propertyName] === undefined){ //get rid of brackets.
						var subBody = {};
						subBody[key] = newBody[keys[i]];
						body[propertyName] = subBody;
					}
					else{
						var subBody = newBody[propertyName];
						subBody[key] = body[keys[i]];
						body[propertyName] = subBody;
					}
		
				}
				else{
					body[keys[i]] = newBody[keys[i]];
				}
			}
			req.body = body;
			next.req = req;
		}
		next();
		return req;
	}
}

/*
 * Returns the body parser middleware.
 */
miniExpress.bodyParser = function(){
	return function(req,res,next){
		var urlencodedMid = miniExpress.urlencoded;
		var jsonMid = miniExpress.json;
		var json = jsonMid();
		var urlencoded = urlencodedMid(); 
		next.req = json(req,res,function(){});
		next.req = urlencoded(next.req,res,function(){});
		next();
	}
}

/*
 * Returns the res object for the handlers.
 */
function createRes(response){
	var res = {};
	res.httpRes = response;
	res.set = function(field,value){
		if(value != undefined){
			res.httpRes.setHeader(field,value);
		}
		else{ //set multiple fields at once.
			var keys = Object.keys(field);
			
			for(var i = 0; i < keys.length; i++){
				res.httpRes.setHeader(keys[i],field[keys[i]]);
			}
		}
	};
	res.status = function(code){
		res.httpRes.statusCode = code;
		res.statusCode = code;
		return this;
	};
	res.get = function(field){
		var value = res.httpRes.getHeader(field);
		return value;
	};
	res.cookie = function(name,value,options){
		var cookieValue = "";
		if(value instanceof Object){
			cookieValue += name + "=" + JSON.stringify(value);
		}
		else{
			cookieValue += name + "=" + value;
		}
		if(options != undefined){
			cookieValue += "; " ;
		}
		else{
			res.httpRes.setHeader('Set-Cookie',cookieValue);
			return;
		}
		if(options["maxAge"] != undefined){
			var date = new Date(Date.now() + options["maxAge"]);
			cookieValue += "Expires=" + date.toUTCString() + ";";
		}
		if(options["expires"] != undefined){
			cookieValue += "Expires=" + options[expires] + ";";
		}
		if(options["path"] != undefined){
			cookieValue += "Path=" + options["path"] + ";";
		}
		else{
			cookieValue += "Path=" + "/" + ";";
		}
		if(options["domain"] != undefined){
			cookieValue += "Domain=" + options["domain"] + ";";
		}
		if(options["secure"] != undefined){
			if(options["secure"]){
				cookieValue += "Secure;"
			}
		}
		if(options["httpOnly"] != undefined){
			if(options["httpOnly"]){
				cookieValue += "HttpOnly;"
			}
		}
		cookieValue = cookieValue.substring(0,cookieValue.length - 1);
		res.httpRes.setHeader('Set-Cookie',cookieValue);
	};
	res.send = function(bodyOrStatus,body){
		
		if(body === undefined && typeof bodyOrStatus === 'number'){ //we received only status code
			res.httpRes.write(miniHttp.STATUS_CODES[bodyOrStatus]);
			return;
		}
		var realParam;
		var stat;
		if(body === undefined){ //we received buffer or string in the first param
			realParam = bodyOrStatus;
		}
		else{//we received buffer or string in the second param and code in the first.
			realParam = body;
			stat = bodyOrStatus;
		}
		var contentType = res.get("content-type");
		var contentLength = res.get("content-length");
		if(realParam instanceof Buffer){
			if(contentType === undefined){
				res.set('Content-Type',"application/octet-stream");
			}
			if(contentLength === undefined){
				res.set('Content-Length', realParam.length);
			}
			if(stat != undefined){
				res.status(stat);
			}
			res.httpRes.write(realParam); 
			return;
		}
		if(typeof realParam === 'string'){

			res.set('Content-Type','text/html');
			if(contentLength === undefined){
				res.set('Content-Length',realParam.length);
			}
			if(stat != undefined){
				res.status(stat);
			}
			res.httpRes.write(realParam); 
			return;
		}
		if(bodyOrStatus instanceof Array || bodyOrStatus instanceof Object ||
			body instanceof Array || body instanceof Object){
			res.json(bodyOrStatus,body);
			return;
		}
		
		
		
		
	};
	res.json = function(bodyOrStatus,body){
		var realParam;
		var stat;
		if(body === undefined){ //we received buffer or string in the first param
			realParam = bodyOrStatus;
		}
		else{//we received buffer or string in the second param and code in the first.
			realParam = body;
			stat = bodyOrStatus;
		}
		if(stat != undefined){
			res.status(stat);
		}
		var jsonBody = JSON.stringify(realParam);
		res.set('Content-Type','application/json');
		res.set('Content-Length',jsonBody.length);
		res.httpRes.write(jsonBody); 
	};
	return res;
}
module.exports = miniExpress;

