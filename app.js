var app = require('http').createServer(handler),
    logger = require('anytv-node-logger'),
    cudl = require('cuddle')(logger),
    io = require('socket.io')(app),
    _ = require('lodash'),
    fs = require('fs'),
    streamers = [],
    recheck,
    timer;

app.listen(9999);

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
    streamers.push(data);
  });
});

function start_check () {
  streamers.length ? start_finding() : setTimeout(start_check, 1000);
}
start_check();

function start_finding () {
  _(streamers)
    .forEach(function (a, key){
      cudl.get
        .to('http://www.you1tube.com/find_streamers')
        .send(a)
        .then(function (err, result) {
          if (io.engine.clients) {
            if (err) {
              io.emit('online_streamers', err);
            }

            io.emit('online_streamers', result);
          }
        });
    }).
    commit();
    setTimeout(start_finding, 900000);
}