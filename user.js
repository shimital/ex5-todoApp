var express = require('./ex4WebServer/miniExpress');
var http = require('./ex4WebServer/miniHttp');
var app = express();
var users = require('./users');
var uuid = require('uuid');
console.log("starting to initialize!!!!!!!!!!!")


app.post("/register",express.json());

app.post("/register",function(req,res,next){
	if(users.get(req.body.username) !== undefined){
		res.status(500).send({error: "username already exists! pick another one."});
	}	
	else{
		users.insertUser(req.body);
		res.status(200).send("successfuly registered");
	}
});

app.post("/login",express.json());

app.post("/login",function(req,res,next){
	if(users.get(req.body.username) !== undefined && 
		req.body.password === users.get(req.body.username).password){
		var cookie = uuid.v1();
		var date = new Date();
		date.setTime(date.getTime() + 30 * 60 * 1000);
		res.set({'Set-Cookie': 'key='+cookie + "; Expires=" + date.toGMTString()});
		users.setUserByCookie(cookie,req.body.username);
		res.status(200).send("successfuly loged-in");
	}
	else{
		res.status(500).send("username or password is incorrect");
	}
});

app.use("/item",express.cookieParser());

app.use("/item",express.json());

/**
 * checks if the session is still alive.
 */
function isSessionEnded(cookies){
	if(cookies === undefined ){
		return true
	}
	else if(users.getUserByCookie(cookies.key) === undefined){
		return true;
	}
	else{
		return false;
	}
}

app.get("/item",function(req,res){
	if(!isSessionEnded(req.cookies)){
		var username = users.getUserByCookie(req.cookies.key);
		var todos = users.getTodos(username);
		res.status(200).send(todos);
	}
	else{
		res.status(400).send("session expired, please log-in");
	}
});

app.post("/item",function(req,res){
	if(!isSessionEnded(req.cookies)){
		var username = users.getUserByCookie(req.cookies.key);
		var stat = users.insertTodo(username, req.body.id, req.body.value);
		res.status(500).send(stat);
	}
	else{
		res.status(400).send("session expired, please log-in");
	}
});

app.put("/item",function(req,res){
	if(!isSessionEnded(req.cookies)){
		var username = users.getUserByCookie(req.cookies.key);
		var stat = users.updateTodo(username, req.body.id, req.body.value, req.body.status === 1);
		res.status(500).send(stat);
	}
	else{
		res.status(400).send("session expired, please log-in");
	}
});

app.delete("/item/:id",function(req,res){
	if(!isSessionEnded(req.cookies)){
		var username = users.getUserByCookie(req.cookies.key);
		var intId = parseInt(req.params.id);
		if(intId < 0){
			var stat = users.deleteCompleted(username);
			res.status(500).send(stat);
		}
		else{
			var stat = users.deleteTodo(username,intId);
			res.status(500).send(stat);
		}
	}
	else{
		res.status(400).send("session expired, please log-in");
	}
	
});

app.get("/partials",express.static(__dirname + "/partials"));

app.use("/",express.static(__dirname));

http.createServer(app).listen(process.env.PORT || 80);
console.log("starting to listen!!!!!!!!!!!")
