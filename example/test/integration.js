var test    = require('tape');
var request = require('request');
var qs      = require('querystring');
var host    = "http://127.0.0.1:";
var port    = Math.floor(Math.random() * 9000) + 1000;

process.env.PORT = port;
// var server = require('../server');

var exec = require('child_process').exec;
exec('node ./example/server.js', function(error, stdout, stderr) {
  // console.log(stdout);             // uncomment for console.log
  // console.log('stderr: ', stderr); // uncomment for errors
  if (error !== null) {
    console.log('exec error: ', error);
  }

});

setTimeout(function() { // only run tests once child_process has started

  test("Connect to localhost "+host+":"+port, function (t) {
    request(host+port ,function (err, res, body) {
      // console.log(err);
      // t.equal(err, null, "No Errors Connecting");
      // console.log(res);
      t.equal(res.statusCode, 200, "Status 200");
      t.end();
    });
  });

  // attempt to access content before being authenticated
  test("Attempt auth "+host+port+"/auth (incorrect username/password should fail)", function (t) {

    var form = {
      username: 'lordbusiness',
      password: 'kragle',
    };

    var formData      = qs.stringify(form);
    var contentLength = formData.length;

    var options = {
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0'
      },
      uri: host+port+"/auth",
      body: formData,
      method: 'POST'
    }

    request.post(options ,function (err, res, body) {
      t.equal(res.statusCode, 401, "Cannot authenticate (incorrect un/pw)");
      t.end();
    });
  });

  test("Attempt to access restricted content: "+host+port+"/private without supplying a valid token!", function (t) {

    var options = {
      headers: {
        'authorization': 'invalid',
        'user-agent': 'Mozilla/5.0'
      },
      uri: host+port+"/private",
      method: 'GET'
    }

    request(options ,function (err, res, body) {
      t.equal(res.statusCode, 401, "Private content access denied!");
      t.end();
    });
  });


  var token   = null; // starts out empty && Yes, GLOBAL (its a test!)

  test("Authenticate "+host+port+"/auth", function (t) {

    var form = {
      username: 'masterbuilder',
      password: 'itsnosecret',
    };

    var formData      = qs.stringify(form);
    var contentLength = formData.length;

    var options = {
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded',
        'user-agent': 'Mozilla/5.0'
      },
      uri: host+port+"/auth",
      body: formData,
      method: 'POST'
    }

    request.post(options ,function (err, res, body) {
      token = res.headers.authorization; // save the token for later
      t.equal(res.statusCode, 200, "Authenticated");
      t.end();
    });
  });

  test("Access restricted content: "+host+port+"/private", function (t) {

    var options = {
      headers: {
        'authorization': token,
        'user-agent': 'Mozilla/5.0'
      },
      uri: host+port+"/private",
      method: 'GET'
    }

    request(options ,function (err, res, body) {
      t.equal(res.statusCode, 200, "Private content accessed");
      t.end();
    });
  });

  // simulate logging out (reset token) >> how do we Invalidate it...?
  test("Log out "+host+port+"/logout", function (t) {
    var options = {
      headers: {
        'authorization': token,
        'user-agent': 'Mozilla/5.0'
      },
      uri: host+port+"/logout",
      method: 'GET'
    }
    request(options ,function (err, res, body) {
      t.equal(body, 'Logged Out!', "Exit server");
      t.equal(res.statusCode, 200, "End tests!");
      t.end();
    });
  });

  // simulate logging out (reset token) >> how do we Invalidate it...?
  test("Attempt access using expired token (after logout)", function (t) {
    var options = {
      headers: {
        'authorization': token,
        'user-agent': 'Mozilla/5.0'
      },
      uri: host+port+"/private",
      method: 'GET'
    }
    request(options ,function (err, res, body) {
      // t.equal(body, 'Logged Out!', "Exit server");
      t.equal(res.statusCode, 401, "Access Denied! (as expected)");
      t.end();
    });
  });


  test("EXIT "+host+port+"/exit", function (t) {
    request(host+port+"/exit" ,function (err, res, body) {
      t.equal(body, 'bye', "Exit server");
      t.equal(res.statusCode, 404, "End tests!");
      t.end();
    });
  });

}, 442); // give the server time to start


process.on('uncaughtException', function(err) {
  console.log('FAIL ... ' + err);
});
