# Learn to use JSON Web Tokens (JWT) for Authentication

![dilbert fixed the internet](http://i.imgur.com/cNElVof.jpg)

Learn how to use JSON Web Token (JWT) to *secure* your Web and/or Mobile Application!

[![Node.js Version][node-version-image]][node-version-url] [![Build Status][travis-image]][travis-url] [![Test Coverage][coveralls-image]][coveralls-url] [![Dependency Status](https://david-dm.org/docdis/learn-json-web-tokens.svg)](https://david-dm.org/docdis/learn-json-web-tokens)
[![Code Climate](https://codeclimate.com/github/docdis/learn-json-web-tokens/badges/gpa.svg)](https://codeclimate.com/github/docdis/learn-json-web-tokens)


## *Why*?

Do you want any (*all*) of these:

+ [x] Secure your website/app ***without cookies***.
  + [x] No cookies means **no *annoying* cookie message** on your website
  (see: [e-Privacy Directive](https://ico.org.uk/for-organisations/guide-to-pecr/cookies/))
+ [x] ***Stateless*** authentication (simplifies [***horizontal scaling***](http://en.wikipedia.org/wiki/Scalability#Horizontal_and_vertical_scaling))
+ [x] ***Prevent*** (mitigate) Cross-Site Request Forgery (**CSRF**) attacks.

## What?

> "* **JSON Web Token** (JWT) is a compact **URL-safe** means of
> representing claims to be transferred between two parties.
> The claims in a JWT are encoded as a JSON object that is digitally
> signed using JSON Web Signature (JWS)*.  ~ IETF

###  In *English*

*Instead* of using a browser **cookie** to authenticate people in your (web) app,
you put a standard-based token in the **header** or **url** of the page
(or API endpoint) which proves the user has logged in and is allowed to
access the desired content.

example: `https://www.yoursite.com/private-content/?jwt=eyJ0eXAiOiJKV1Qi.eyJrZXkiOi.eUiabuiKv`

**Note**: if this does not *look* "secure" to you,
scroll down to the "***issues***"" section.

### What does a JWT *Look* Like?

Tokens are a string of "url safe" characters which *encode* information.
Tokens have **three components** (separated by periods)
(shown here on multiple lines for *readability* but used as a single string of text)

```js
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9           // header
.eyJrZXkiOiJ2YWwiLCJpYXQiOjE0MjI2MDU0NDV9      // payload
.eUiabuiKv-8PYk2AkGY4Fb5KMZeorYBLw261JPQD5lM   // signature
```

#### 1. Header

The first part of a JWT is an encoded string representation
of a simple JavaScript object which describes the token along with the hashing algorithm used.

#### 2. Payload

The second part of the JWT forms the core of the token.

#### 3. Signature

The third, and final, part of the JWT is a signature generated
based on the header (part one) and the body (part two)

### What are "Claims"?

Claims are the predefined **keys** and their **values**:

+ **iss**: issuer of the token
+ **exp**: the expiration timestamp (reject tokens which have expired)
+ **iat**: The time the JWT was issued. Can be used to determine the age of the JWT
+ **nbf**: "not before" is a future time when the token will become active.
+ **jti**: unique identifier for the JWT. Used to prevent the JWT from being re-used or replayed.
+ **sub**: subject of the token (rarely used)
+ **aud**: audience of the token (also rarely used)

See: http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#RegisteredClaimName

# Example

Lets get stuck in with a simple example.
(the *full* source is in the **/example** directory)

> TRY it: https://jwt.herokuapp.com/

## Server

Using the *core* **node.js http** server we create 4 endpoints in **/example/server.js**:

1. **/home** : home page (not essential but its where our **login** form is.)
2. **/auth** : *authenticate* the visitor (returns error + login form if failed)
3. **/private** : our restricted content ***login require*** (valid session token) to see this page.
4. **/logout** : invalidates the token and logout the user (prevent from re-using old token)

We have *deliberately* made **server.js** as simple as possible for:

+ Readability
+ Maintainability
+ Testability (all helper/handler methods are tested separately)

## Helper Methods

All the helper methods are kept in **/example/lib/helpers.js**
The two most interesting/relevant methods are:

```javascript
// generate the JWT
function generateToken(req){
  var token = jwt.sign({
    auth:  'magic',
    agent: req.headers['user-agent'],
    exp:   new Date().getTime() + 7*24*60*60*1000 // + 1 week (JS timestamp is ms...)
  }, secret);  // secret is defined in the environment variable JWT_SECRET
  return token;
}
```
Which generates our token after the user has authenticated

and

```javascript
// validate the token supplied in request header
function validate(req, res) {
  var token = req.headers['x-access-token'];
  try {
    var decoded = jwt.verify(token, secret);
  } catch (e) {
    return authFail(res);
  }
  if(!decoded || decoded.auth !== 'magic') {
    return authFail(res);
  } else {
    return privado(res, token);
  }
}
```

**Note**: *Yes*, *both* these methods are ***synchronous***.
But given that they do not require any I/O or Network requests,
its safe to compute them synchronously.


## Testing






## Issues with Tokens?

### Q: If I put the JWT in the *URL* or *Header* is it *secure*?

Good question! The *quick* **answer** is: ***No***.  
Unless you are using SSL/TLS (http**s** in your url) to encrypt the connection,
sending the Token [***in-the-clear***](http://en.wikipedia.org/wiki/Plaintext)

### Q: How do we *Invalidate* sessions?

The person using your app has their **device** (phone/tablet/laptop)
***stolen*** how do you invalidate the token they were using?

The idea behind JWT is that the tokens are ***stateless***
they can be computed


### Q: Returning Visitor (*no State Preservation between sessions*)

Cookies are stored on the client and sent by the browser to the server
on every request. Because the Which means if the person *closes* their browser
they do not loose their session cookie (can re-open where they left off without
  having to log-in again)

## Background Reading

- Original Specification Draft:
https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-32
- Good intro (ruby-specific examples):
http://www.intridea.com/blog/2013/11/7/json-web-token-the-useful-little-standard-you-haven-t-heard-about  
+ Friendlier introduction: http://jwt.io/
+ Getting to know JWT:
https://scotch.io/tutorials/the-anatomy-of-a-json-web-token
- Discussion: https://ask.auth0.com/c/jwt


## Which Node.js Module?

A search for "**JSON Web Token**" on NPM:
https://www.npmjs.com/search?q=json+web+token yields ***many*** results!

![npm search for json web token](http://i.imgur.com/ZLN3LlW.png)

We *highly* recommend using the **jsonwebtoken** module
made by our friends [@auth0](https://twitter.com/auth0)
([the identity/authentication experts](https://auth0.com/about)):
- https://github.com/auth0/node-jsonwebtoken  
Which in turn uses:
https://github.com/brianloveswords/node-jws  
[![NPM][jsonwebtoken-icon] ][jsonwebtoken-url]


## Further Reading

+ JWT with Passport.js:
http://stackoverflow.com/questions/20228572/passport-local-with-node-jwt-simple
+ JWT Tokens as API Keys:
https://auth0.com/blog/2014/12/02/using-json-web-tokens-as-api-keys/
+ Information Security discussion:
http://security.stackexchange.com/questions/51294/json-web-tokens-jwt-as-user-identification-and-authentication-tokens
+ Using JWT with node.js (express + backbone):
http://www.sitepoint.com/using-json-web-tokens-node-js/
+ Token-based Authentication with Socket.IO
https://auth0.com/blog/2014/01/15/auth-with-socket-io/
+ JWT Auth *discussion* on Hacker News:
https://news.ycombinator.com/item?id=7084435
+ The Spec but nicer:
http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html
+ Extended (Wiki) article on Claims-based authentication:
http://en.wikipedia.org/wiki/Claims-based_identity
+ Securing Requests with JWT:
http://websec.io/2014/08/04/Securing-Requests-with-JWT.html

[jsonwebtoken-icon]: https://nodei.co/npm/jsonwebtoken.png?downloads=true
[jsonwebtoken-url]: https://npmjs.org/package/jsonwebtoken
[npm-image]: https://img.shields.io/npm/v/esta.svg?style=flat
[npm-url]: https://npmjs.org/package/esta
[node-version-image]: https://img.shields.io/node/v/esta.svg?style=flat
[node-version-url]: http://nodejs.org/download/
[downloads-image]: https://img.shields.io/npm/dm/esta.svg?style=flat
[downloads-url]: https://npmjs.org/package/esta
[travis-image]: https://img.shields.io/travis/docdis/learn-json-web-tokens.svg?style=flat
[travis-url]: https://travis-ci.org/docdis/learn-json-web-tokens
[coveralls-image]: https://img.shields.io/coveralls/docdis/learn-json-web-tokens.svg?style=flat
[coveralls-url]: https://coveralls.io/r/docdis/learn-json-web-tokens?branch=master
[dependencies-url]: https://david-dm.org/docdis/learn-json-web-tokens
[dependencies-image]: https://david-dm.org/docdis/learn-json-web-tokens.svg
