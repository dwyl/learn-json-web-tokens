var port = process.env.PORT || 1337; // let heroku define port or use 1337
var http = require('http');          // core node.js http (no frameworks)
var app  = require('./lib/helpers'); // auth, token verification & render helpers

http.createServer(function (req, res) {
  var url = req.url;
  if( url === '/' || url === '/home' ) { app.home(res);  } // homepage
  else if( url === '/auth')    { app.handler(req,res);   } // authenticator
  else if( url === '/private') { app.validate(req, res); } // private content
  else if( url === '/logout')  { app.logout(req, res);   } // end session
  else if( url === '/exit')    { app.exit(res);          } // for testing ONLY
  else                         { app.notFound(res);      } // 404 error
}).listen(port);

console.log("Visit: http://127.0.0.1:" + port);
