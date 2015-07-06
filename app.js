var app = require('http').createServer(handler),
    logger = require('anytv-node-logger'),
    cudl = require('cuddle')(logger),
    io = require('socket.io')(app),
    fs = require('fs'),
    streamers,
    recheck,
    timer;

app.listen(9999);

function find_streamers (data) {
  cudl.get
    .to('http://www.you1tube.com:9999/find_streamers')
    .send(data)
    .then(function (err, result) {
      if (io.engine.clients) {
        if (err) {
          io.emit('online_streamers', err);
        }

        io.emit('online_streamers', result);
      }
    });
}

function start_check (data) {
  clearInterval(timer);
  find_streamers(data);
  setTimeout(start_check, 900000);
}
start_check();

function handler (req, res) {
    fs.readFile(__dirname + '/index.html',
        function (err, data) {
            if (err) {
                res.writeHead(500);
                return res.end('Error loading index.html');
            }

            res.writeHead(200);
            res.end(data);
        });
}

io.on('connection', function (socket) {
  socket.on('user_favorite_streamers', function (data) {
    streamers = data;
  });
});

timer = setInterval(function () {
  if (streamers) {
    start_check(streamers);
  }
}, 1000);
