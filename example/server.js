const port = process.env.PORT || 1337; // let heroku define port or use 1337
const http = require('http');          // core node.js http (no frameworks)
const url  = require('url');           // core node.js url (no frameworks)
const app  = require('./lib/helpers'); // auth, token verification & render helpers
const c    = function(res){ /*  */ };

http.createServer(function (req, res) {
  const path = url.parse(req.url).pathname;
  if( path === '/' || path === '/home' ) { app.home(res);           } // homepage
  else if( path === '/auth')    { app.handler(req, res);            } // authenticator
  else if( path === '/private') { app.validate(req, res, app.done); } // private content
  else if( path === '/logout')  { app.logout(req, res, app.done);   } // end session
  else if( path === '/exit')    { app.exit(res);                    } // for testing ONLY
  else                          { app.notFound(res);                } // 404 error
}).listen(port);

console.info("Visit: http://127.0.0.1:" + port);
