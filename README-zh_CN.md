![JWT logo wider](http://i.imgur.com/qDOOu4o.jpg)

# 学习如何使用 **JSON Web Tokens** (JWT) 进行**鉴权**

![dilbert fixed the internet](http://i.imgur.com/cNElVof.jpg)

学习怎么使用 JSON Web Token (JWT) 来**加密**你的 Web 应用或者移动应用!

[![Build Status](https://img.shields.io/travis/dwyl/learn-json-web-tokens/master.svg?style=flat-square)](https://travis-ci.org/dwyl/learn-json-web-tokens)
[![codecov.io](https://img.shields.io/codecov/c/github/dwyl/learn-json-web-tokens/master.svg?style=flat-square)](http://codecov.io/github/dwyl/learn-json-web-tokens?branch=master)
[![codeclimate-maintainability](https://img.shields.io/codeclimate/maintainability/dwyl/learn-json-web-tokens.svg?style=flat-square)](https://codeclimate.com/github/dwyl/learn-json-web-tokens/maintainability)
[![Dependencies Status](https://david-dm.org/dwyl/learn-json-web-tokens/status.svg?style=flat-square)](https://david-dm.org/dwyl/learn-json-web-tokens)
[![devDependencies Status](https://david-dm.org/dwyl/learn-json-web-tokens/dev-status.svg?style=flat-square)](https://david-dm.org/dwyl/learn-json-web-tokens?type=dev)
[![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat-square)](https://github.com/dwyl/learn-json-web-tokens/issues)
[![HitCount](http://hits.dwyl.io/dwyl/learn-json-web-tokens.svg)](http://hits.dwyl.io/dwyl/learn-json-web-tokens)


## **为什么**?

JSON Web Tokens (JWTs) 使得在服务之间（**包括在你 app 或者网站的内部和外部**） _**发送只读签名**_ 的 “_**声明**_“ 变得很**简单**。

声明是你想让某些人**阅读**或**校验**但不能修改的**任意**字节的数据。

> **注意**：**如果听起来很啰嗦，请不要担心，阅读 5 分钟之后一切都会变得清晰起来的！**

## 是什么?

> “***JSON Web Token***（JWT）是一种紧凑的 URL 安全方式，用于表示在双方之间传输的声明。JWT 中的声明被**编码**为使用JSON Web 签名（JWS）进行数字签名的 **JSON 对象**。——IETF

###  **通俗一点**

为了在你的 app（web或者移动端）中辨识或授权用户，在 **header** 或者页面（或者 API）的 **url** 中放置一个**基于标准的 token**，它表明了这个用户已经登录并且被允许获取到他想要的内容。

示例：`https://www.yoursite.com/private-content/?token=eyJ0eXAiOiJKV1Qi.eyJrZXkiOi.eUiabuiKv`

> **注意**：如果这对于你而言还不够“安全”，往下翻到“[***security***](#q-我把-jwt-放在-url-或者-header-是安全的吗)”这一节。

### JWT **看起来**是什么样的？

Tokens 是一系列“url 安全”的字符所组成的字符串，它包含了**编码**后的信息。
Tokens 由**三部分**组成（用小数点分割）,为了便于阅读，下面用三行来展示，但是实际使用时是一个单独的字符串。

```
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9           // 头部
.eyJrZXkiOiJ2YWwiLCJpYXQiOjE0MjI2MDU0NDV9      // 载荷
.eUiabuiKv-8PYk2AkGY4Fb5KMZeorYBLw261JPQD5lM   // 签名
```

#### 1. 头部

JWT 的第一部分是一个编码的字符串，它表示一个简单的 JavaScript 对象，这个对象描述了 token 所使用的哈希算法。

#### 2. 载荷

JWT 的第二部分是 token 的核心，负载的长度与你在 JWT 中所存储的数据长度有关。
通常所遵守的准则是：存储尽量少的必要的数据在 JWT 中。


#### 3. 签名

第三部分是最后一部分，是根据头部（第一部分）和主体（第二部分）所计算出来的一个签名，会被用于**校验** JWT 是否有效。

### 什么是“声明”？

Claims are the predefined **keys** and their **values**:

声明是预定义的一系列**键**和它们所对应的**值**：

+ **iss**: token 的发行人。
+ **exp**: 到期时间戳（已过期的令牌会被拒绝）。注意：如规范中所定义，以秒为单位。
+ **iat**: token 的发行时间。可以用于判断 JWT 的发行时间长。
+ **nbf**: "not before" 是 JWT 被激活的某个未来时间（可以理解为生效时间）。
+ **jti**: JWT 的第一无二的标识（编号），用于防止 JWT 被重复使用或者重复产生。
+ **sub**: token 的主题（很少使用）。
+ **aud**: token 的受众（同样很少使用）。

详情阅读： http://self-issued.info/docs/draft-ietf-oauth-json-web-token.html#RegisteredClaimName

# 示例 [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/learn-json-web-tokens/issues)

让我们通过一个简单的示例来继续深入学习 JWT。
（**全部**源码都在 **/example** 目录下）

> 动手尝试： https://jwt.herokuapp.com/

可以在 Gitpod（需要通过 GitHub 授权登录） 上亲自动手尝试一下这个示例。

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io#https://github.com/dwyl/learn-json-web-tokens/blob/master/example/lib/helpers.js)

## 服务器

通过使用 **node.js 的 核心模块 http** 服务器，我们在 **/example/server.js** 创建了四个接口：

1. **/home** : 首页（不是必要的，但是我们的 **login** 表单放在这里）。
2. **/auth** : 对游客进行**授权** （如果授权失败会返回错误并且回到首页的 login 表单）。
3. **/private** : 我们的受保护的内容 - ***需要登录***（有合法的会话 token）才能看到这个页面。
4. **/logout** : 使 token 失效并且登出用户（防止重复使用旧的 token）。

我们已经**有意地**把 **server.js** 写得足够的简单了：

+ 可阅读
+ 可维护
+ 可测试（所有的 helper/handler 方法都已经被单独测试）

> 注意： 如果你可以让示例更**简单**，请提交 [issue](https://github.com/dwyl/learn-json-web-tokens/issues) 一起讨论！

## Helper 方法

所有 helper 类方法都保存在 **/example/lib/helpers.js**
两个最有意思或者说最相关的方法是（下面是简化版本）：

```javascript
// 构造 JWT 的方法。
function generateToken(req){
  return jwt.sign({
    auth:  'magic',
    agent: req.headers['user-agent'],
    exp:   Math.floor(new Date().getTime()/1000) + 7*24*60*60; // 注意：单位是秒！
  }, secret);  // secret 被定义在环境变量 JWT_SECRET 中
}
```

当用户进行授权的时候，这个方法会计算出我们的 JWT token，这个 token 随后会被放在 **Authorization** 响应头发送回客户端，用于后续的请求。

另外一个

```javascript
// 校验请求头 Authorization 中的 token 是否有效。
function validate(req, res) {
  var token = req.headers.authorization;
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

Which **checks the JWT supplied by the client is valid**,
shows private ("privado") content to the requestor if valid
and renders the **authFail** ***error*** page if its not.

该方法**会检查客户端提供的 JWT 是否有效**，如果有效就会展示私有内容（通过 "privado" 方法）给请求者；如果校验失败，会通过**authFail** 方法渲染 ***错误页*** 。

**注意**: 这两个方法**都是同步的**。这两个方法都没有进行任何的 IO 操作或者网络请求，所以同步计算是安全的。

> 提示：如果你正在为你的 Hapi.js 应用寻找 ***全能的*** **JWT Auth Hapi.js 插件** （**异步**校验或验证） 请查看： [https://github.com/**dwyl/hapi-auth-jwt2**](https://github.com/dwyl/hapi-auth-jwt2)

## 测试

你可能已经注意到了教程开头的 [![Build Status][travis-image]][travis-url] 这些铭牌，这是一个标志，作者不只是**堆砌**代码在一起。

对服务器路由和 helper 类方法的测试都放在 **/example/test**。

1. /example/test/**functional.js** - 测试我们在 /example/lib/**helpers.js** 中创建的所有 **helper 类方法**。
[![Test Coverage](https://codeclimate.com/github/dwyl/learn-json-web-tokens/badges/coverage.svg)](https://codeclimate.com/github/dwyl/learn-json-web-tokens)
2. /example/test/**integration.js** - 模拟**用户**对服务器所发起的请求并测试服务器**响应**。

请**阅读**所有测试案例，如有不清楚的地方，可以**告诉我们**。

**注意**：我们为 http req/res 对象写了一个基本的“**mock**”: /example/test/**mock.js**

如果还不懂 mock 或者很好奇，请阅读：[When to Mock (by "Uncle Bob")](http://blog.8thlight.com/uncle-bob/2014/05/10/WhenToMock.html)

- - -

## 常见问题及解答

> ***有问题吗? 马上提问!*** >> https://github.com/dwyl/learn-json-web-tokens/issues

### Q: 我把 JWT 放在 *URL* 或者 *Header* 是**安全**的吗？

问得好！答案是：“**否**”，除非你使用 SSL/TLS 加密你的连接（https），使用[明文](http://en.wikipedia.org/wiki/Plaintext)发送 Token 永远都是不安全的（token 可以被拦截并且被坏蛋重用）。一种比较笨拙简单的方法是添加校验声明到 token，比如检查请求是否来自于同一个浏览器（user-agent），添加IP 地址或者更先进的“[**browser fingerprints**](http://stackoverflow.com/a/3287761/1148249)”…… http://programmers.stackexchange.com/a/122385

解决方案包括:
+ 使用一次性 token，在链接点击后即失效 ***或者***
+ 在安全性要求较高的场景下不把 token 放在 url 中。
(比如：不把执行交易的链接发送给别人)

JWT 放在 url 中的**使用场景**:
+ 账户校验 - 当你把激活账户的链接通过 Email 发送给在你网站注册了的客户的时候。 `https://yoursite.co/account/verify?token=jwt.goes.here`
+ 密码重置 - 确保重置密码的人能够登录与账户有关的邮件。
 `https://yoursite.co/account/reset-password?token=jwt.goes.here`

上面的案例都是使用一次性 token 的适用场景 (****点击后就失效****)。

### Q: 怎么使会话失效?

如果使用你 app 的人的**设备**（手机/平板电脑/笔记本电脑）**被盗了**，那你应该如何使它们使用的 token 失效？

JWT 背后的思想是**无状态**，它们可以被集群中的任意节点计算出来并且验证，而不用对数据库发起任何请求。

#### 把 token 存在数据库中?

##### LevelDB

如果你的应用规模比较**小**，或者你不想运行一个 Redis 服务器，你可以通过使用 LevelDB：http://leveldb.org/ 来从 Redis 获取最大的好处。

我们可以把有效的 token 存储在数据库中，或者相反地把非法的 token 存储在数据库中。这两种方案都需要往返数据库以检查 token 是否有效。所以我们倾向于存储所有的 token 到数据库，并且把 token 的 *valid* 字段从 true 更新为 false，表示 token 已经过期。

存储在 LevelDB 中的示例：
```json
"GUID" : {
  "auth" : "true",
  "created" : "timestamp",
  "uid" : "1234"
}
```
我们将通过 GUID 来查找这条记录：

```js
var db = require('level');
db.get(GUID, function(err, record){
  // pseudo-code
  if(record.auth){
    // 展示私有内容（通过了校验）
  } else {
    // 展示错误信息（校验未通过）
  }
});
```
通过查看 example/lib/helpers.js 中的 **validate** 方法获取更多详情。

##### Redis

Redis 是存储令牌的**可扩展**方式。

如果你**从未**接触过 Redis，请阅读:
+ Intro: http://redis.io/topics/introduction
+ Redis in 30 mins:
http://openmymind.net/2011/11/8/Redis-Zero-To-Master-In-30-Minutes-Part-1/
+ What is Redis? http://www.slideshare.net/dvirsky/introduction-to-redis

Redis ***Scales*** (provided you have the RAM):
http://stackoverflow.com/questions/10478794/more-than-4-billion-key-value-pairs-in-redis

> ***从现在开始学习 Redis！*** [https://github.com/dwyl/**learn-redis**](https://github.com/dwyl/learn-redis)

#### Memcache?

***Quick* answer**: *使用 **Redis***:
http://stackoverflow.com/questions/10558465/memcache-vs-redis


### Q: 返回游客（**会话之间没有状态保存**）

Cookie 存储在客户端，并且每次请求时都会由浏览器发送到服务器。如果关闭了浏览器，则会保留 Cookie，因此可以在上次停止的地方继续操作而不必再次登录。但是 cookie 会在与路径和发布域匹配的所有请求上发送，包括不需要的图像和 css 请求。

[`localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window.localStorage) 提供了一种更好的在浏览器会话之间存储 token 的机制。

#### 基于浏览器的应用

有以下两种方式存储你的 JWT：

1. 使用 ***localStorage*** 在客户端存储你的 JWT（**意味着你需要把 JWT 放在 `authorization` header 中返回给客户端，以便后续 http/ajax 请求使用**）
2. 把 JWT 存储在 cookie 中。

> 我们更倾向于第一种方法。但是如果使用得当的话，cookie 仍然可以在现代 web 应用中发挥他们的作用！

##### 一些有用的网站

+ Good ***history*** & overview of **Localstorage**:
http://diveintohtml5.info/storage.html
+ MDN **Window.localStorage**:
https://developer.mozilla.org/en-US/docs/Web/API/Window.localStorage
+ Brief description + basic *examples*:
http://www.html5rocks.com/en/features/storage
+ Will it work for *my* visitors?
http://caniuse.com/#search=localstorage
(**Quick answer**: ***Yes***! IE 8 & above, Android 4.0+, IOS 7.1+, Chrome & Firefox )


#### 编程式（API）访问

其它服务访问你的 API 时必须把令牌存储在检索系统中（比如：移动应用的 Redis 或 SQLite）并且把 token 带入到每一个请求中。

### 如何生成密钥？

> “**如果这个问题在其它地方被提到过的话我感到抱歉。用于计算 token 的私钥和 ssh-keygen 生成的私钥是一样的吗？** ~最初由 [@skota](https://github.com/skota) 提出问题，更多详细: [dwyl/**hapi-auth-jwt2/issues**/48](https://github.com/dwyl/hapi-auth-jwt2/issues/48)

因为 JSON Web Token（JWT）不要求使用[**非对称加密**](http://en.wikipedia.org/wiki/Public-key_cryptography)进行签名，所以**不必**使用 ssh-keygen 生成密钥。你可以简单地只使用一个**强密码**,例如：https://www.grc.com/passwords.htm 提供了足够长的复杂的随机的字符串。这样的话使用相同加密字符串的可能性（有人能够修改有效负载，添加或修改声明以及创建有效签名的可能性）非常低。如果你将两个**强密码**（字符串）连接在一起，你将拥有一个 128 位的 ASCII 字符串。因此，碰撞的可能性小于[宇宙中的原子数](http://en.wikipedia.org/wiki/Observable_universe#Matter_content_.E2.80.94_number_of_atoms)。

To quickly and easily create a secret key using Node's crypto library, run this command.

使用以下命令可以通过 Node 的 crypto 模块快速而简单地创建一个密钥。

    node -e "console.log(require('crypto').randomBytes(32).toString('hex'));"

换句话说，你**可以**使用一个 ***RSA 密钥***，但是这不是必要的。

你需要记住的最重要的一件事就是：不要把这个密钥泄露给核心组（”*DevOps Team*“）成员之外的任何人或者**意外地**将它发布到了 GitHub！


## 哪个 Node.js 模块？

在 NPM 上搜索 ”**JSON Web Token**“：https://www.npmjs.com/search?q=json+web+token 会产生许多结果！

![npm search for json web token](http://i.imgur.com/ZLN3LlW.png)

### 使用 Hapi.js 构建 Web 应用？

我们努力简化在 Hapi.js 应用程序中使用 JWT 的过程，在这个过程中我们写了这个模块：https://github.com/dwyl/hapi-auth-jwt2


### **其它** Node.js 项目的常用方法

我们**强烈**推荐 **jsonwebtoken** 这个模块，它由我们的朋友[@auth0](https://twitter.com/auth0)
([校验/鉴权领域的专家](https://auth0.com/about))编写:
- https://github.com/auth0/node-jsonwebtoken
Which in turn uses:
https://github.com/brianloveswords/node-jws
[![NPM][jsonwebtoken-icon] ][jsonwebtoken-url]

另外一个非常棒的选择是： https://github.com/joaquimserafim/json-web-token
也是我们的朋友 [@joaquimserafim](https://github.com/joaquimserafim) 编写的。

## 必要的阅读(**预习**)

- Original **Specification** (Draft):
https://tools.ietf.org/html/draft-ietf-oauth-json-web-token-32
- Great overview from Atlassian:
https://developer.atlassian.com/cloud/jira/platform/understanding-jwt/
- Good intro (ruby-specific examples):
http://www.intridea.com/blog/2013/11/7/json-web-token-the-useful-little-standard-you-haven-t-heard-about
+ Friendlier introduction: http://jwt.io/
+ Getting to know JWT:
https://scotch.io/tutorials/the-anatomy-of-a-json-web-token
- Discussion: https://ask.auth0.com/c/jwt
+ ***How to*** do **stateless authentication** (session-less & cookie-less):
http://stackoverflow.com/questions/20588467/how-to-do-stateless-session-less-cookie-less-authentication


## 深入阅读(**推荐**) [![contributions welcome](https://img.shields.io/badge/contributions-welcome-brightgreen.svg?style=flat)](https://github.com/dwyl/learn-json-web-tokens/issues)

+ JWT with Passport.js:
http://stackoverflow.com/questions/20228572/passport-local-with-node-jwt-simple
+ JWT Tokens as API Keys:
https://auth0.com/blog/2014/12/02/using-json-web-tokens-as-api-keys/
+ **10 Things you should know** about ***Tokens and Cookies***:
https://auth0.com/blog/2014/01/27/ten-things-you-should-know-about-tokens-and-cookies/#xss-xsrf
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
+ Avoid Database in authenticating user for each request (stateless):
http://security.stackexchange.com/questions/49145/avoid-hitting-db-to-authenticate-a-user-on-every-request-in-stateless-web-app-ar
+ The Twelve-Factor App: http://12factor.net/ + http://12factor.net/processes
+ Auth in Hapi with JWT: https://medium.com/@thedon/auth-in-hapi-with-jwt-780ce4d072c7#.clgj5lknq
+ Token based authentication in Node.js with Passport, JWT and bcrypt: https://jonathas.com/token-based-authentication-in-nodejs-with-passport-jwt-and-bcrypt/

# **感谢**您和我们一起学习！

如果您认为这篇快速阅读很有帮助, 请在 GitHub 上给我们一颗星星（Star）并且转推分享给其他人：https://twitter.com/olizilla/status/626487231860080640

[![olizilla tweet](http://i.imgur.com/rCvNvvk.jpg)](https://twitter.com/olizilla/status/626487231860080640 "Please Re-Tweet!")
