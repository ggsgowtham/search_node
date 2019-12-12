var express = require('express');
var routes = require('./routes');
var http = require('http');
var urlencoded = require('url');
var path = require('path');
var bodyParser = require('body-parser');
var json = require('json');
var logger = require('logger');
var methodOverride = require('method-override');

//creating the database
//url is couchdatabase localhost
var nano = require('nano')('http://localhost:5984/');
var db = nano.use('address');  //address is db name
var app = express();

var port = "3000";
app.set('port', port);
app.set('views',path.join(__dirname,'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodOverride());
app.use(express.static(path.join(__dirname,'public')));

app.get('/',routes.index);

//post for creating new database
app.post('/createdb', function(req,res) {
	nano.db.create(req.body.dbname, function(err) {
		if(err) {
			res.send('Error in creating Database'+req.body.dbname);
			return;
		}
		res.send('Database'+req.body.dbname+'created successfully');
	});
});

//post for creating new contact form
app.post('/new_contact',function(req,res) {
	var name = req.body.name;
	var phone = req.body.phone;

	//phone created outside parameter is the key and all contacts will be saved
	db.insert({name: name, phone: phone, crazy: true}, phone,function(err,body,header) {
		if(err) {
			res.send('Error creating contact');
			return;
		}
		res.send('contact created successfully');
	});
});

//post for viewing contact
app.post('/view_contact',function(req,res) {
	var alldoc = "following are the contacts";
	// revis_info -> revisions info
	db.get(req.body.phone, {revs_info: true}, function(err,body) {
		if(!err) {
			console.log(body);
		}
		if(body) {
			alldoc += "Name:"+body.name+"<br />Phone Number:"+body.phone;
		}else{
			alldoc = "No results found";
		}
		res.send(alldoc);
	});
});

//Post for deleting contact
app.post('/delete_contact',function(req,res) {
	db.get(req.body.phone, {revs_info: true}, function(err,body) {
		if(!err) {
			db.destroy(req.body.phone, body._rev, function(err,body) {
				if(err) {
					res.send('Error in deleting');
				}
			});
			res.send('Contacts deleted successfully');
		}
	});
});

// Creating a server
http.createServer(app).listen(app.get('port'), function() {
	console.log('Express server listening to server'+app.get('port'));
});