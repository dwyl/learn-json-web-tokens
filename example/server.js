var host = "127.0.0.1";
var port = process.env.PORT || 1337; // let heroku define port
var qs   = require('querystring');
var fs   = require('fs');
var http = require('http');
var jwt  = require('jsonwebtoken');

// Content
var index      = fs.readFileSync(__dirname+'/index.html');      // default page
var restricted = fs.readFileSync(__dirname+'/restricted.html'); // only show if JWT valid

function authHandler(req,res){
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      console.log(post)
      // use post['blah'], etc.
    });
  }
  // default to fail

}


http.createServer(function (req, res) {
  console.log("URL:",req.url);

  if(req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);

  } else if(req.url === '/private') {




    console.log(req.headers)
    if(req){
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('Private');
    } else {
      console.log('failed');
    }

  } else if(req.url === '/auth') {

    authHandler(req,res);


    var token = jwt.sign({ key: 'val' }, 'secret');
    console.log(token);
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('great success');

  } else if(req.url === '/exit') {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('bye');
    // console.log('EXIT');
    process.exit(); // kill the server!

  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('Not Found');
  }
}).listen(port, host);

console.log("Visit: http://"+ host +":" + port);
