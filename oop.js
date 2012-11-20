events = require('events');

//server class
function server(port){
	this.port = port;
	this.clients = [];
}

server.prototype.listen = function() {
  	this.connection = require('net').createServer();
  	this.connection.listen(this.port, (function(){
		console.log('server listening on ' + this.port)
	}).bind(this));
  	return this.connection.on('connection', this.addClient.bind(this));
};

server.prototype.addClient = function(socket){
	var id = this.clients.length;
	
	this.clients[id] = new client(socket, id);
	
	socket.on('close', (function(){
		this.clients.splice(id, 1);
	}).bind(this));
};

server.prototype.writeToClient = function(){
	console.log('hallo');
};

//client class
function client(socket, id){
	this.id = id;
	this.socket = socket;
	this.address = this.socket.address();
	this.ip = this.address['address'];
	this.port = this.address['port'];
	
	this.socket.on('connect', (function(){
		console.log('client [' + this.ip + '] has connected via port [' + this.port + '] and received the id [' + this.id + ']');
	}).bind(this));

	this.socket.on('data', (function(data){
		console.log('client [' + this.ip + '] send: ' + data);
	}).bind(this));
}

client.prototype.write = function(data){
	return this.socket.write(data);
};

function webserver(port){
	this.port = port;
	this.clients = [];
}

webserver.prototype.listen = function(){
	this.io = require('socket.io').listen(this.port, (function(){
		console.log('webserver running on ' + this.port);
	}).bind(this));
	
	return this.io.sockets.on('connection', this.addWebClient.bind(this));
};

webserver.prototype.addWebClient = function(socket){
	this.clients.push(new webclient(socket));
	console.log('webclient connected');
	this.tcp.writeToClient();
};

//webclient
function webclient(socket){
	this.socket = socket;
	this.socket.on('message', function(message){
		console.log(message);
	});
}

function programm(){
	this.tcpServer = new server(2222).listen();
	this.webServer = new webserver(72).listen();
	
	this.tcpServer.web = this.webServer;
}

main = new programm();