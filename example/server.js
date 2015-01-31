var host = "127.0.0.1";
var port = process.env.PORT || 1337; // let heroku define port
var qs   = require('querystring');
var fs   = require('fs');
var http = require('http');
var jwt  = require('jsonwebtoken');

// Content
var index      = fs.readFileSync(__dirname+'/index.html');      // default page
var restricted = fs.readFileSync(__dirname+'/restricted.html'); // only show if JWT valid
var fail       = fs.readFileSync(__dirname+'/fail.html');       // auth fail

var usr = { un: 'masterbuilder', pw: 'itsnosecret' };

// create JWT


// handle authorisation requests
function authHandler(req,res){
  console.log("METHOD: "+req.method)
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      console.log(post);
      // authentication success
      if(post.username && post.username === usr.un && post.password && post.password === usr.pw){
        // create json token
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(restricted);
      }

      // use post['blah'], etc.
    });
  }
  // default to fail
  res.writeHead(401, {'Content-Type': 'text/html'});
  res.end(fail);
}

function tokenValid(req) {
  console.log(req.headers)
  return true;
}


http.createServer(function (req, res) {
  console.log("URL:",req.url);

  if(req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);

  } else if(req.url === '/private') {

    if( tokenValid(req) ) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(restricted);
    } else {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      console.log(index);
    }

  } else if(req.url === '/auth') {

    authHandler(req,res);

    // var token = jwt.sign({ key: 'val' }, 'secret');
    // console.log(token);
    // res.writeHead(200, {'Content-Type': 'text/plain'});
    // res.end('great success');

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
