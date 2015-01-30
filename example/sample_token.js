// sign with default (HMAC SHA256)
var jwt = require('jsonwebtoken');
var token = jwt.sign({ key: 'val' }, 'secret');
console.log(token);
