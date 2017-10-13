var port = process.env.PORT || 1337; // let heroku define port or use 1337
var http = require('http');          // core node.js http (no frameworks)
var url = require('url');            // core node.js url (no frameworks)
var app  = require('./lib/helpers'); // auth, token verification & render helpers
var c    = function(res){ /*  */ };

http.createServer(function (req, res) {
  var path = url.parse(req.url).pathname;
  if( path === '/' || path === '/home' ) { app.home(res);           } // homepage
  else if( path === '/auth')    { app.handler(req, res);            } // authenticator
  else if( path === '/private') { app.validate(req, res, app.done); } // private content
  else if( path === '/logout')  { app.logout(req, res, app.done);   } // end session
  else if( path === '/exit')    { app.exit(res);                    } // for testing ONLY
  else                          { app.notFound(res);                } // 404 error
}).listen(port);

console.log("Visit: http://127.0.0.1:" + port);
