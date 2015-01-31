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

// secret
var secret = "CHANGE_THIS_TO_SOMETHING_RANDOM";

// show fail page (login)
function authFail(res) {
  res.writeHead(401, {'Content-Type': 'text/html'});
  res.end(fail);
}

function authSuccess(req, res) {
  // create JWT
  var token = jwt.sign({ auth: 'magic', agent: req.headers['user-agent'] }, secret);

  res.writeHead(200, {
    'Content-Type': 'text/html',
    'x-access-token': token
  });
  res.end(restricted);
}

// handle authorisation requests
function authHandler(req,res){
  // lookup person in database
  var usr = { un: 'masterbuilder', pw: 'itsnosecret' };

  console.log("METHOD: "+req.method)
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      // authentication success
      if(post.username && post.username === usr.un && post.password && post.password === usr.pw){
        authSuccess(req, res);
      } else {
        return authFail(res);
      }
    });
  } else {
    return authFail(res);
  }
}



function tokenValid(req, res) {
  console.log(req.headers)
  var token = req.headers['x-access-token'];
  var decoded = jwt.verify(token, secret);
  console.log(decoded);
  return true;
}


http.createServer(function (req, res) {
  console.log("URL:",req.url);

  if(req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);

  } else if(req.url === '/private') {

    if( tokenValid(req, res) ) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(restricted);
    } else {
      fail(res);
    }

  } else if(req.url === '/auth') {
    console.log(req.headers);
    authHandler(req,res);

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
