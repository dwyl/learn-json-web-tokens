var test        = require('tape');
var request     = require('request');
var querystring = require('querystring');
var token       = '';
var host        = "http://127.0.0.1:";
var port        = 1337;


var exec = require('child_process').exec;
exec('node ./example/server.js', function(error, stdout, stderr) {
  // console.log('stdout: ', stdout);
  // console.log('stderr: ', stderr);
  if (error !== null) {
    console.log('exec error: ', error);
  }

});

setTimeout(function() { // only run tests once child_process has started

  test("CONNECT to localhost "+host+":"+port, function (t) {
    request(host+port ,function (err, res, body) {
      // console.log(err);
      t.equal(err, null, "✓ No Errors Connecting");
      // console.log(res);
      t.equal(res.statusCode, 200, "✓ Status 200");
      t.end();
    });
  });

  // attempt to access content before being authenticated

  // attempt to authenticate
  test("Authenticate "+host+port+"/auth", function (t) {

    var form = {
      username: 'masterbuilder',
      password: 'itsnosecret',
    };

    var formData = querystring.stringify(form);
    var contentLength = formData.length;

    var options = {
      headers: {
        'Content-Length': contentLength,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      uri: host+port+"/auth",
      body: formData,
      method: 'POST'
    }

    request(options ,function (err, res, body) {
      console.log(body);
      // t.equal(body, 'bye', "✓ Exit server");
      t.equal(res.statusCode, 200, "✓ Authenticated");
      t.end();
    });
  });



  test("EXIT "+host+port+"/exit", function (t) {
    request(host+port+"/exit" ,function (err, res, body) {
      console.log(body);
      t.equal(body, 'bye', "✓ Exit server");
      t.equal(res.statusCode, 404, "✓ End tests!");
      t.end();
    });
  });

}, 50); // give the server time to start


process.on('uncaughtException', function(err) {
  console.log('FAIL ... ' + err);
});
