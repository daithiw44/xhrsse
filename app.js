var http = require('http')
, fs = require('fs')
, events = require('events')
, listeners = []
, Sessions = require('sessions')
, sessionHandler = new Sessions()
, sys = require('sys')
, broadcasters = {
  'one' : []
  , 'two' : []
  , 'three': []
};

/** Start Module UnicodeLoremIpsum **/
function UnicodeLoremIpsum(timer) {
  var self = this, randomnumber;
  setInterval(function() {
    randomnumber = Math.floor(Math.random() * 2700);
    self.emit('event', '&#' + randomnumber);
  },timer);
}

sys.inherits(UnicodeLoremIpsum, events.EventEmitter);
/** End Module UnicodeLoremIpsum **/

var eins = new UnicodeLoremIpsum(2000);
var zwei = new UnicodeLoremIpsum(3000);
var drei = new UnicodeLoremIpsum(5000);

eins.on('event', function(message) {
  channelHandler('one', message);
});
zwei.on('event', function(message) {
  channelHandler('two', message);
});
drei.on('event', function(message) {
  channelHandler('three', message);
});

function channelHandler(channel, message) {
  broadcasters[channel].forEach(function(el,index,array) {
    if(listeners.hasOwnProperty(el)){
      eventClient = listeners[el].client;
      eventClient.onEvent({'channel' : channel, 'message' : message});
    }
  });
}

var server = http.createServer(function(req, res) {
    /*sessionHandler.on('expired', function (sessionuid) {
      audi(sessionuid);
    });*/

  sessionHandler.httpRequest(req, res, function(err, session) {
    var client, buf, index, postJSON, channelaction, filename, readStream;
    if (err) {
      return res.end('session error');
    }

    if (req.url === '/') {
      req.url === '/index.html';
    }

    if (req.url === '/stream') {
      if (!listeners[session.uid()]) {
        client = new EventClient(req, res, session.uid());
        listeners[session.uid()] = {
          'client': client
        };
        eventClient = listeners[session.uid()].client;
      }
    }
    else if (req.method === 'POST' && req.url === '/channel') {
      buf = '';
      req.setEncoding('utf8');
      req.on('data', function(chunk) {
        console.log(chunk);
        buf += chunk;
      });
      req.on('end', function() {
        postJSON = JSON.parse(buf);
        channelaction = postJSON.channel.split('_');
        console.log('ca', channelaction);
        index = broadcasters[channelaction[0]].indexOf(session.uid());
        if (channelaction[1] === 'add') {
          console.log('p');
          broadcasters[channelaction[0]].push(session.uid());
        }
        else {
          tuneOut(session.uid(), channelaction[0]);
        }
        res.writeHead(200, 'OK', {
          'content-type': 'text/json'
        });
        res.write('{"channel" : "' + channelaction[0] + '", "tune" :"' + channelaction[1] + '"}');
        res.end();
      });
    }
    else if (req.url !== '/favicon.ico') {
      console.log('here', req.url);
      filename = (__dirname + '/static' + req.url);
      readStream = fs.createReadStream(filename);
      readStream.pipe(res);
    }
  });
});

server.listen(process.env.VCAP_APP_PORT || 3000);

function audi(sessionuid) {
  var index = listeners[sessionuid];
  if (index !== -1) {
    delete listeners[sessionuid];
    setTimeout(
      function() {
        if (!listeners.hasOwnProperty(sessionuid)) {
          Object.keys(broadcasters).forEach(function(key) {
            tuneOut(sessionuid, key);
          });
        }
      }
    , 5000);
  }
}

function tuneOut(sessionuid, channel) {
  var before, after, index = broadcasters[channel].indexOf(sessionuid);
  if (index !== -1) {
    before = broadcasters[channel].slice(0, index);
    after = broadcasters[channel].slice(index + 1);
    broadcasters[channel] = before.concat(after);
  }
}

/** Start Module EventClient **/
function EventClient_onEvent(e) {
  var _this = this;
  console.log(e);
  _this.res.write('data: ' + JSON.stringify(e) + '\r\n\r\n');
}

function EventClient(req, res, sessionuid) {
  this.res = res;
  this.onEvent = EventClient_onEvent.bind(this);
  req.connection.addListener('close', function() {
    //exit
    audi(sessionuid);
  });
  res.writeHead(200, {'Content-Type': 'text/event-stream'});
  console.log('write');
  res.write(' '); // flush headers
}
/** End Module EventClient **/

