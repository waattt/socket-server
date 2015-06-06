// Load requirements
var
	http = require('http'),
    io = require('socket.io'),
	port = process.env.PORT || 6379,
	clients = [],
	boards = new Object();

// Create server & socket
var server = http.createServer(function(req, res){
    // Send HTML headers and message 404
    res.writeHead(404, {'Content-Type': 'text/html'});
    res.end('<h1>Aw, snap! 404.</h1>');	
});
server.listen(port);
io = io.listen(server);

io.sockets.on('connection', function(socket) { 

    console.log('Client connected: (id=' + socket.id + ')');
	clients.push(socket);
	console.log('Clients connected: ' + clients.length);
	
    // Disconnect listener
    socket.on('disconnect', function() {
        var index = clients.indexOf(socket);
        if (index != -1) {
            clients.splice(index, 1);
            console.log('Client gone (id=' + socket.id + ').');			
			console.log('Clients connected: ' + clients.length);
        }
    });
	
	socket.on('init', function(msg){
		boards[msg.id] = msg;
		boards[msg.id].clientID = socket.id;
	});
	socket.on('sensorChange', function(data){		
		if(clients.length > 1){
			var pushTo = boards[data.id].otherid;
			pushTo = boards[pushTo].clientID;		
			io.to(pushTo).emit('update', data);
			console.log('emitting... to ' + pushTo);
		}
	});
});