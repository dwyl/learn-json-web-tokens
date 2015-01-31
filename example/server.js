var host = "127.0.0.1";
var port = process.env.PORT || 1337; // let heroku define port
var http = require('http');
var e    = require('./helpers'); // auth, token verification & render helpers

http.createServer(function (req, res) {
  if(req.url === '/')             { e.home(res);          }
  else if(req.url === '/private') { e.validate(req, res); }
  else if(req.url === '/auth')    { e.handler(req,res);   }
  else if(req.url === '/logout')  { e.logout(res);        }
  else if(req.url === '/exit')    { e.exit(res);          }
  else                            { e.notFound(res);      }
}).listen(port, host);

console.log("Visit: http://"+ host +":" + port);
