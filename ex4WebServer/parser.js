
/*
 * Checks what requests arrived fully, and what requests arrived partially, and returns 
 * an object that contains array of ready request that can be processed and a string which is not
 * null if there is a partial request.
 */
function organiseRequests(userRequest){
	var requestsRecord = {goodRequest: null, headers:null, body:null, partialRequest: null}; //this object will contain 
		// request that is ready for processing, and optionally a response
		// that some elements of it are still missing.				
	var endHeaders = new RegExp("\r\n\r\n");
	var sizeReg = new RegExp("[0-9]+");
	var contentReg = new RegExp("(c|C)ontent-(l|L)ength:.*");
	if(endHeaders.test(userRequest)){  // it means that there is a request(perhaps without the body yet).
		var reqElements = userRequest.split("\r\n\r\n");// array that holds some headers and perhaps a body
		reqElements = removeEmptyStr(reqElements);
		if(reqElements.length > 1){ //it means there is a body.
			if(contentReg.test(reqElements[0])){
				var contentLengthLine = contentReg.exec(reqElements[0]);
				var sizeStr = sizeReg.exec(contentLengthLine);
				var size = parseInt(sizeStr);
				if(size > reqElements[1].length){ //there is a partial body.
					requestsRecord.partialRequest = reqElements[0] + reqElements[1];
					return requestsRecord;
				}
				else{
					requestsRecord.headers = reqElements[0];
					requestsRecord.body = reqElements[1];
					requestsRecord.goodRequest = reqElements[0] + reqElements[1];
					return requestsRecord;
				}
			}
		}
		else{
			requestsRecord.headers = reqElements[0];
			requestsRecord.goodRequest = reqElements[0];
			return requestsRecord;
		}
	}
	else{
		requestsRecord.partialRequest = userRequest;
	}
}

/*
 * Returns header object with field and values.
 */
function generateHeaders(headersStr){
	var headersArr = headersStr.split("\r\n");
	headersObj = {};
	var firstReqLine = headersArr[0].split(" ");
	headersObj["method"] = firstReqLine[0];
	headersObj["resource"] = firstReqLine[1];
	var version = firstReqLine[2].split("/")[1];
	headersObj["version"] = version;
	for(var i = 1; i < headersArr.length; i++){
		var headerParts = headersArr[i].split(":");
		headersObj[headerParts[0].toLowerCase()] = headerParts[1].trim();
	}
	return headersObj;

}
/*
 * reads the important request fields and stores them in object paramas and then returns params.
 */
function readRequests(userRequests){
	var requestsRecord = organiseRequests(userRequests);
	var params = {method: null, resource:null,version:null,headers: null,body:null, partialRequest: null}; 	
	params.partialRequest = requestsRecord.partialRequest;
	if(params.partialRequest != null){
		return params; // no point to read headers if the request is incomplete at this stage.
	}
	reqParams = generateHeaders(requestsRecord.headers);
	params.method = reqParams["method"];
	params.resource = reqParams["resource"];
	params.version = reqParams["version"];
	delete reqParams["method"];
	delete reqParams["resource"];
	delete reqParams["version"];
	params.headers = reqParams;
	params.body = requestsRecord.body;
	return params;
}	

/*
 * Removes cells with empty strings in the requests arr.
 */
function removeEmptyStr(arr){
	if(arr[arr.length - 1] === ""){
		arr.splice(arr.length - 1,1);
	}
	if(arr[0] === ""){
		arr.splice(0,1);
	}
	return arr;
}






exports.readRequests = readRequests;