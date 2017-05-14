function divEscapedContentElement(message) {
	return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
	return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
	var message = $('#send-message').val();
	var systemMessage;
	if (message.charAt(0) == '/') {
		systemMessage = chatApp.processCommand(message);
		if (systemMessage) {
			$('#messages').append(divSystemContentElement(systemMessage));
		}
	} else {
		chatApp.sendMessage($('#room').text(), message);
		$('#messages').append(divEscapedContentElement(message));
		$('#messages').scrollTop($('#messages').prop('scrollHeight'));
	}
	$('#send-message').val('');
}


function rc4(key, str) {
	var s = [], j = 0, x, res = '';
	for (var i = 0; i < 256; i++) {
		s[i] = i;
	}
	for (i = 0; i < 256; i++) {
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
	}
	i = 0;
	j = 0;
	for (var y = 0; y < str.length; y++) {
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
		res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
	}
	return res;
}

var socket = io.connect();

$(document).ready(function() {
	var chatApp = new Chat(socket);
	socket.on('nameResult', function(result) {
		var message;
		if (result.success) {
			message = 'Твое имя  ' + result.name + '.';
		} else {
			message = result.message;
		}
		$('#messages').append(divSystemContentElement(message));
	});

	socket.on('joinResult', function(result) {
		$('#room').text(result.room);
		$('#messages').append(divSystemContentElement('Комната выбрана.'));
	});

	socket.on('message', function(message) {
		console.log('sdsdsdd');
		console.log(message.sessionId);
		var newElement = $('<div></div>').text(message.text);
		$('#messages').append(newElement);
	});

	socket.on('messageToUser', function(message) {
		var position = message.text.search(/:/);
		var nickname = message.text.slice(0, position);
		console.log('pos');
		console.log(position);
		var texxt = message.text.slice(position+1);
		var textDiv = rc4(/*message.sessionId*/'room', texxt/*message.text*/);
		var newElement = $('<div></div>').text(nickname + ': ' + textDiv);
		$('#messages').append(newElement);
	});

	socket.on('rooms', function(rooms) {
		$('#room-list').empty();
		for (var room in rooms) {
			room = room.substring(1, room.length);
			if (room != '') {
				$('#room-list').append(divEscapedContentElement(room));
			}
		}
		$('#room-list div').click(function() {
			chatApp.processCommand('/join' + $(this).text());
			$('#send-message').focus();
		});
	});

	setInterval(function() {
		socket.emit('rooms');
	}, 5000);

	$('#send-message').focus();
	$('#send-form').submit(function() {
		processUserInput(chatApp, socket);
		return false;
	});

	});