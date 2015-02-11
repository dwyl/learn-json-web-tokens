// both the request and response http objects are event emitters
var events = require('events'); // lets use the core node.js event emmitter
var req = new events.EventEmitter(); // gives us req.emit and req.on('data')
var res = new events.EventEmitter(); // gives us res.emit and req.on('data')

// mock methods for http request & response
// request should have:
// req.headers
// just set the desired headers object before invoking the function
// here are a few defaults
req.headers = {
  'Content-Type': 'text/html',
  'user-agent': 'Mozilla/5.0',
}

// req.method e.g: POST or GET
// default to POST cause our check is for this method in authHandler
req.method = 'POST';

// req.on('data' ... borrowed from event emitter (see above)
// req.on('end'  ... event emitter (again)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

// response shoud have
// res.writeHead(
res.writeHead = function(status, headers) {
  res = res || {};
  res.headers = headers;
  res.status  = status;
  return res;
}

// res.end(
res.end = function(str) {
  res = res || {};
  res.body = str;
  return res;
}


module.exports = {
  req : req,
  res : res
}
