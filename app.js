var app = require('http').createServer(handler),
    logger = require('anytv-node-logger'),
    cudl = require('cuddle')(logger),
    io = require('socket.io')(app),
    fs = require('fs'),
    streamers,
    recheck;

app.listen(9999, function () {
  console.log('\n---------------------------------------------\nSocket is alive. Port: 9999\n---------------------------------------------\n');
});

function find_streamers () {
  cudl.get
    .to('http://www.you1tube.com/find_streamers')
    .send(streamers)
    .then(function (err, result) {
      if (io.engine.clients) {
        if (err) {
          io.emit('online_streamers', err);
        }

        io.emit('online_streamers', result);
      }
    });
}

function start_iteration () {
  recheck = function () {
    find_streamers();
    setTimeout(recheck, 900000);
    // 900000 = 15 minutes (check streamers if they are online every 15 minutes)
  };

  recheck();
}

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
    start_iteration();
  });
});
