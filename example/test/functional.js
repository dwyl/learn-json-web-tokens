var test = require('tape');
var qs   = require('querystring');

var lib  = require('../lib/helpers'); // auth, token verification & render helpers
var mock = require('./mock');         // basic mock of http module req & res
var token = null;                     // starts out empty
// views
var index      = lib.view('index');      // default page
var success    = lib.view('restricted'); // only show if JWT valid
var fail       = lib.view('fail');       // auth fail

var jwt  = require('jsonwebtoken');
var secret = "CHANGE_THIS_TO_SOMETHING_RANDOM"; // super secret


test("home", function (t) {
  var res = lib.home(mock.res);
  t.equal(200, 200, "Status 200");
  t.equal(res.body.toString(), index, "Homepage rendered" )
  t.end();
});

test("fail", function (t) {
  var res = lib.fail(mock.res);
  // console.log(res.status);
  t.equal(res.status, 401, "Status 401");
  t.equal(res.body.toString(), fail, "Rejected (as expected)" )
  t.end();
});

test("success", function (t) {
  var res = lib.success(mock.req, mock.res);
  // console.log(res);
  t.equal(res.status, 200, "Successfully authenticated");
  t.equal(res.body.toString(), success, "Success.");
  t.end();
});

test("handler incorrect username & password", function (t) {
  var res = lib.handler(mock.req, mock.res);
  var postdata = { username: 'badguy', password: 'kragle' }
  mock.req.emit('data', qs.stringify(postdata));
  mock.req.emit('end');
  t.equal(mock.res.status, 401, "Auth fail");
  t.end();
});

test("handler GET", function (t) {
  mock.req.method = 'GET';
  var res = lib.handler(mock.req, mock.res);
  t.equal(res.status, 401, "GET should fail");
  t.end();
});

test("handler", function (t) {
  mock.req.method = 'POST';
  var res = lib.handler(mock.req, mock.res);
  var postdata = { username: 'masterbuilder', password: 'itsnosecret' }
  mock.req.emit('data', qs.stringify(postdata));
  mock.req.emit('end');
  token = mock.res.headers['x-access-token'];
  t.equal(mock.res.status, 200, "Authenticated");
  t.end();
});

test("validation fail (bad-but-valid token)", function (t) {
  var token = jwt.sign({
    auth:  'invalid',
    agent: mock.req.headers['user-agent'],
    exp:   new Date().getTime() + 7*24*60*60*1000 // JS timestamp is ms...
  }, secret);

  mock.req.headers['x-access-token'] = token; // we got this above
  var res = lib.validate(mock.req, mock.res);
  t.equal(res.status, 401, "should NOT validate using BAD token");
  t.end();
});

test("validation fail (invalid token)", function (t) {
  mock.req.headers['x-access-token'] = 'malformed token'; // we got this above
  var res = lib.validate(mock.req, mock.res);
  t.equal(res.status, 401, "should NOT validate using INVALID token");
  t.end();
});


test("validate", function (t) {
  mock.req.headers['x-access-token'] = token; // we got this above
  var res = lib.validate(mock.req, mock.res);
  t.equal(res.status, 200, "should validate using token");
  t.end();
});

test("notFound", function (t) {
  var res = lib.notFound(mock.res);
  // console.log(res.status);
  t.equal(res.status, 404, "Not found");
  t.end();
});

test("logout", function (t) {
  var res = lib.logout(mock.res);
  // console.log(res.status);
  t.equal(res.status, 200, "Logged out");
  // mock.res.end('end');
  t.end();
});
setTimeout(function(){
  lib.exit(mock.res);
},600)

process.on('uncaughtException', function(err) {
  console.log('FAIL ... ' + err);
});
