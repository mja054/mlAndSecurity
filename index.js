var express = require('express')
, cons = require('consolidate')
, http = require('http')
, security = require('./security.js');

var app = express();

// assign dust engine to .dust files
app.engine('dust', cons.dust);

app.configure(function(){
	app.set('view engine', 'dust');
	app.set('views', __dirname + '/public/templates');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.compress());
	//app.use(express.static(__dirname + '/public'));
	security.ddosCheck(app);
	app.use(express.static(__dirname + '/public', {redirect: false}));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser('your secret here'));
	app.use(express.session());
	app.use(express.csrf());
	app.use(app.router);
});

app.get("/",function(request,response){
	response.json("DDOS attack");
});

var PORT = process.env.PORT || 8000;
http.createServer(app).listen(PORT);
