


var fs = require('fs');
var path = require('path');
var util = require('util');
var buffer = require('buffer');

/*
 * Returns the path of the file in the server file system, according to the root folder.
 */
function filePath(originalPath,rootResource,rootFolder){
	if(originalPath === '/'){
		return "./index.html";
	}
	var ResourceRegex = new RegExp(rootResource);
	var isAllowed = ResourceRegex.test(originalPath);
	if(isAllowed){
		var realPath;
		if(rootResource === '/'){
		
			realPath = originalPath.substr(1);
		}
		else{
			 realPath = originalPath.split(rootResource)[1];
		}
		realPath = path.normalize(realPath);
		return realPath;
	}
	else{
		return null;
	}
}



/*
 * Responds to client the http requests.
 */
function createResponse(rootResource,rootFolder,req,res,next){
	var file = filePath(req.path,rootResource,rootFolder); // get the path of 
	fs.stat(file,function(err,stats){
			if(err === null){
				if(stats.isFile()){
					res.status(200);
					res.httpRes.sendDate = true;
					var contentTypeResult = contentType(file);
					res.set("Content-Type",contentTypeResult);
					var filesize = getFileSize(stats);
					res.set("Content-Length",filesize);
					var fileAsAstream = fs.createReadStream(file);	
					fileAsAstream.on('readable',function(){
						var buf;
						while((buf = fileAsAstream.read()) != null){
							res.send(buf);
						} 
					});
				}
			}
			else{
				next();	
			}
		}); 
}


/*
 * Returns the size of the requested file, for the content-length field in the response.
 */
function getFileSize(stats){
	var fileDetailsStr = util.inspect(stats);
	var sizeReg = new RegExp("size: [0-9]*");
	var sizeSection = sizeReg.exec(fileDetailsStr)[0];
	var size = sizeSection.split(' ')[1];
	return size;
}

/*
 * Returns the content-type value as should be according to the requested file extension.
 */
function contentType(filePath){
	
	var extension = path.extname(filePath);
	if(extension === ".txt"){
		return "text/plain";
	}
	if(extension === ".js"){
		return "application/javascript";
	}
	if(extension === ".json"){
		return "application/json";
	}
	if(extension === ".html"){
		return "text/html";
	}
	if(extension === ".css"){
		return "text/css";
	}
	if(extension === ".jpg"){
		return "image/jpeg";
	}
	if(extension === ".gif"){
		return "image/gif";
	}	
	if(extension === ".png"){
		return "image/png";
	}
	
}

exports.createResponse = createResponse;