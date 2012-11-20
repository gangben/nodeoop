//functions

function isInt(value){
    if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
        return true;
    } else {
        return false;
    }
}

//main
//infomation about the tcp connection
var port = 2222;
var client = null;
var net = require('net');
var server = net.createServer();
//statistic
var correctTransmitted = 0;
var falseTransmitted = 0;

//infomation on the http request
var querystring = require("querystring");
var http = require("http");
var post_domain = "localhost";
var post_port = "80";
var post_path = "/rabbit/request.php";

server.on('connection', function(socket){
	
	console.log('new client was listed');
	client = new net.Socket();
	client = socket;
	
	socket.on('data', function(data){
		console.log(data);
		if(data[0] == 59){
			console.log("config string arrived");
			console.log("length of config string: " + data.length);
			io.sockets.send(data);
		}else if(data == 'OK'){
			console.log('target modul has successfully overwritten its configuration');
			io.sockets.send(data);
			client.destroy();
		}else if(data == 'ERROR'){
			console.log('target modul was unable to save the new configuration');
			io.sockets.send(data);
		}else if(data == 'RESET'){
			console.log('target modul will reset');
			io.sockets.send(data);
			client.destroy();
		}else{
			console.log('daten laenge: ' + data.length);
			
			var telegrams = [];
			var length = data.length;
			var n = length/26;
			
			if(isInt(n)){
				for(var i = 0; i < n; i++)
				{
					//cut the telegram from tid to ant but the ant parameter comes after etx we cut until the next stx
					telegrams.push(data.slice((i*26) + 1, (i*26) + 26));
					correctTransmitted++;
				}
			}else{
				falseTransmitted++;
			}
			
			// send whole data via http post request
			for(var i = 0; i < telegrams.length; i++){
	            //preparing post request
	            var post_data = querystring.stringify({
	                'tid': telegrams[i][0],
	                'fid': telegrams[i][1],
	                'id2': telegrams[i][2],
	                'id3': telegrams[i][3],
	                'id4': telegrams[i][4],
	                'id5': telegrams[i][5],
	                'cap': telegrams[i][6],
	                'tmp_1': telegrams[i][7],
	                'tmp_2': telegrams[i][8],
	                'pa_i': telegrams[i][9],
	                'pa_l': telegrams[i][10],
	                'pa_h': telegrams[i][11],
	                'cyc_l': telegrams[i][12],
	                'cyc_h': telegrams[i][13],
	                'pow': telegrams[i][14],
	                'fr0': telegrams[i][15],
	                'fr1': telegrams[i][16],
	                'fr2': telegrams[i][17],
	                'hrel': telegrams[i][18],
	                'srel': telegrams[i][19],
	                'rssi': telegrams[i][20],
	                'lqi': telegrams[i][21],
	                'lcr': telegrams[i][22],
					'ant': telegrams[i][24]
	            });

	            var post_options = {
	                host: post_domain,
	                port: post_port,
	                path: post_path,
	                method: 'POST',
	                headers: {
	                    'Content-Type': 'application/x-www-form-urlencoded',
	                    'Content-Length': post_data.length
	                }
	            };

	            var post_req = http.request(post_options, function(res) {
	                res.setEncoding('utf8');
	                res.on('data', function (chunk) {
	                    console.log('Response: ' + chunk);
	                });
	            });

	            post_req.write(post_data);
	            post_req.end();
				
				io.sockets.send((correctTransmitted + falseTransmitted) + " " + correctTransmitted + " " + falseTransmitted);
	        }
			
		}
	});
	
	socket.on('close', function(){
		console.log('client has disconnected.');
		var client = null;
		io.sockets.send('DISCONNECT');
	});
		
});

server.listen(port, function(){
	console.log('server is listening on port ' + port);
});

server.maxConnections = 1;

var io = require("socket.io").listen(72);

io.sockets.on('connection', function (socket) {
    
	try{
		client.write('config');
	}catch(e){
		console.log('client has not yet connected');
	}
	
    socket.on('message', function(data){
       console.log(data + ' send from socket io');
	   try{
	   		client.write(data);
	   }catch(e){
	   		console.log('client has not yet connected');
	   }
	   
    });
 });
