var host    = "127.0.0.1";
var port    = 1337;

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
  } else if(req.url.indexOf('/exit') > -1){
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('bye');
    console.log('EXIT');
    process.exit(); // kill the server!
  }
}).listen(process.env.PORT || port, host);

console.log("Visit: http://"+ host +":" + port);
