var qs   = require('querystring');
var fs   = require('fs');
var path = require('path');
var jwt  = require('jsonwebtoken');
var secret = "CHANGE_THIS_TO_SOMETHING_RANDOM"; // super secret


function loadView(view) {
  var filepath = path.resolve(__dirname + '../../views/' + view + '.html');
  return fs.readFileSync(filepath).toString();
}
// Content
var index      = loadView('index');      // default page
var restricted = loadView('restricted'); // only show if JWT valid
var fail       = loadView('fail');       // auth fail

// show fail page (login)
function authFail(res) {
  res.writeHead(401, {'Content-Type': 'text/html'});
  return res.end(fail);
}

function generateToken(req){
  // create JWT
  var token = jwt.sign({
    auth:  'magic',
    agent: req.headers['user-agent'],
    exp:   new Date().getTime() + 7*24*60*60*1000 // JS timestamp is ms...
  }, secret);
  return token;
}

function authSuccess(req, res) {
  // console.log(' ---> authSuccess Called');
  var token = generateToken(req);
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'x-access-token': token
  });
  return res.end(restricted);
}

// lookup person in "database"
var db = { un: 'masterbuilder', pw: 'itsnosecret' };

// handle authorisation requests
function authHandler(req,res){
  // >> lookup the actual user in our database in "real" app
  // console.log("METHOD: "+req.method)
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      if(post.username && post.username === db.un && post.password && post.password === db.pw) {
        return authSuccess(req, res);
      } else {
        return authFail(res);
      }
    });
  } else {
    return authFail(res);
  }
}

function validate(req, res) {

  var token = req.headers['x-access-token'];
  try {
    var decoded = jwt.verify(token, secret);
  } catch (e) {
    return authFail(res);
  }
  if(!decoded || decoded.auth !== 'magic') {
    return authFail(res);
  } else {
    return privado(res, token);
  }
}

function privado(res, token) {
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'x-access-token': token
  });
  return res.end(restricted);
}

function exit(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  res.end('bye');
  process.exit(); // kill the server!
}

function notFound(res) {
  res.writeHead(404, {'Content-Type': 'text/plain'});
  return res.end('Not Found');
}

function home(res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  return res.end(index);
}

function logout(res) {
  // "destroy" (invalidate) the token
  res.writeHead(200, {'Content-Type': 'text/plain'});
  return res.end('Logged Out!');
}

module.exports = {
  fail : authFail,
  exit: exit,
  home: home,
  handler : authHandler,
  logout : logout,
  notFound : notFound,
  success : authSuccess,
  validate : validate,
  view : loadView
}
