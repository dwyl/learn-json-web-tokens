var host = "127.0.0.1";
var port = process.env.PORT || 1337; // let heroku define port
var http = require('http');
var e    = require('./helpers'); // auth, token verification & render helpers

http.createServer(function (req, res) {
  console.log("URL:",req.url);

  if(req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(e.index);

  } else if(req.url === '/private') {

    if( e.validate(req, res) ) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(e.restricted);
    } else {
      e.fail(res);
    }

  } else if(req.url === '/auth') {
    console.log(req.headers);
    e.handler(req,res);

  } else if(req.url === '/logout') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('Logged Out!');

  } else if(req.url === '/exit') {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('bye');
    process.exit(); // kill the server!

  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
}).listen(port, host);

console.log("Visit: http://"+ host +":" + port);
