var qs   = require('querystring');
var fs   = require('fs');
var path = require('path');

var level = require('level');
var db = level(__dirname + '/db');

var jwt  = require('jsonwebtoken');
var secret = process.env.JWT_SECRET || "CHANGE_THIS_TO_SOMETHING_RANDOM"; // super secret

function loadView(view) {
  var filepath = path.resolve(__dirname + '../../views/' + view + '.html');
  return fs.readFileSync(filepath).toString();
}

// Content
var index      = loadView('index');      // default page
var restricted = loadView('restricted'); // only show if JWT valid
var fail       = loadView('fail');       // auth fail

// show fail page (login)
function authFail(res, callback) {
  res.writeHead(401, {'Content-Type': 'text/html'});
  return res.end(fail);
}

// generate a GUID
function generateGUID() {
  return new Date().getTime(); // we can do better with crypto
}

// create JWT
function generateToken(req, GUID) {
  var token = jwt.sign({
    auth:  GUID,
    agent: req.headers['user-agent'],
    exp:   new Date().getTime() + 7*24*60*60*1000 // JS timestamp is ms...
  }, secret);
  return token;
}

function authSuccess(req, res) {
  var GUID   = generateGUID(); // write/use a better GUID generator in practice
  var token  = generateToken(req, GUID);
  var record = {
    "valid" : true,
    "created" : new Date().getTime()
  };

  db.put(GUID, JSON.stringify(record), function (err) {
    // console.log("record saved ", record);
  })
  res.writeHead(200, {
    'Content-Type': 'text/html',
    'x-access-token': token
  });
  return res.end(restricted);
}

// lookup person in "database"
var u = { un: 'masterbuilder', pw: 'itsnosecret' };

// handle authorisation requests
function authHandler(req, res){
  if (req.method == 'POST') {
    var body = '';
    req.on('data', function (data) {
      body += data;
    }).on('end', function () {
      var post = qs.parse(body);
      if(post.username && post.username === u.un && post.password && post.password === u.pw) {
        return authSuccess(req, res);
      } else {
        return authFail(res);
      }
    });
  } else {
    return authFail(res);
  }
}

function verify(token) {
  try {
    var decoded = jwt.verify(token, secret);
  } catch (e) {
    var decoded = false;
  }
  return decoded;
}

function validate(req, res, callback) {
  var token = req.headers['x-access-token'];
  var decoded = verify(token);
  if(!decoded || !decoded.auth) {
    authFail(res);
    return callback(res);

  } else {
    // check if a key exists, else import word list:
    db.get(decoded.auth, function (err, record) {
      try {
        var r = JSON.parse(record);
      } catch (e) {
        var r = { valid : false };
      }
      if (err || !r.valid) {
        authFail(res);
        return callback(res);
      } else {
        privado(res, token);
        return callback(res);
      }
    });
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

function done(res) {
  return; // does nothing. (pass as callback)
}

function logout(req, res, callback) {
  // invalidate the token
  var token = req.headers['x-access-token'];
  // console.log(' >>> ', token)
  var decoded = verify(token);
  if(decoded) { // otherwise someone can force the server to crash by sending a bad token!
    // asynchronously read and invalidate
    db.get(decoded.auth, function(err, record){
      var updated    = JSON.parse(record);
      updated.valid = false;
      db.put(decoded.auth, updated, function (err) {
        // console.log('updated: ', updated)
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Logged Out!');
        return callback(res);
      });
    });
  } else {
    authFail(res, done);
    return callback(res);
  }
}


module.exports = {
  fail : authFail,
  exit: exit,
  done: done, // moch callback
  home: home,
  handler : authHandler,
  logout : logout,
  notFound : notFound,
  success : authSuccess,
  validate : validate,
  verify : verify,
  view : loadView
}
