
var express = require('express');
var routes = require('./routes');
var http = require('http');
var app = express();


 

//configuration
require('./config')(express, app);


//routes
routes(app);



//listen
var port = process.env.PROT ? process.env.PORT:80
	http.createServer(app).listen(port,function(){
		console.log('server is listening %d ', port);

	});	
