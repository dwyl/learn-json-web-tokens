var test    = require('tape');
var request = require('request');
var host    = "127.0.0.1";
var port    = 5000

test("CONNECT to localhost "+host+":"+port, function (t) {
  request(host+":"+port ,function (err, res, body) {
    t.equal(err, null, "✓ No Errors Connecting");
    console.log(res);
    t.equal(res.status, 200, "✓ Status 200 - OK");
    t.end();
  });
});
