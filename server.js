var http = require('http');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var cache = {};
var port = process.env.PORT || 3000;
function send404(response) {
	response.writeHead(200, {'Content-Type': 'text/plain'});
	response.write('Error 404: resource not found.');
	response.end();
}

function sendFile(response, filePath, fileContents) {
	response.writeHead(200, 
		{'Content-Type': mime.lookup(path.basename(filePath))}
		);
	response.end(fileContents);
}

function serveStatic(response, cache, absPath) {
	if (cache[absPath]) {
		sendFile(response, absPath, cache[absPath]);
	} else {
		fs.stat(absPath, function(errorr, exists) {
			if (errorr) {
				fs.readFile(absPath, 'utf8', function(err, data) {
					if (err) {
						console.log(absPath);
						send404(response);
					} else {
						cache[absPath] = data;
						sendFile(response, absPath, data);
					}
				});
			} else {
				
				send404(response);
			}
		});
	}
}

var server = http.createServer(function(request, response) {
	var filePath = false;
	if (request.url == '/') {
		filePath = 'public/index.html';
	} else {
		filePath = 'public' + request.url;
	}
	var absPath = './' + filePath;
	serveStatic(response, cache, absPath);
	console.log(__dirname);
})
server.listen(port, function() {
	console.log('server listen');
});


var chatServer = require('./lib/chat_server');
chatServer.listen(server);