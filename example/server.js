var host    = "127.0.0.1";
var port    = 5000

var http = require('http');
var fs = require('fs');
var index = fs.readFileSync(__dirname+'/index.html');
// var client = fs.readFileSync(__dirname+'/client.js');

http.createServer(function (req, res) {
  console.log("URL:",req.url);
  if(req.url === '/'){
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
  } else if(req.url.indexOf('/auth/') > -1){

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('great success');
  } else {
    res.end('bye');
  }
}).listen(process.env.PORT || port);
