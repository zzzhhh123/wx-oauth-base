## 微信OAuth

## 提示
Superagent需要Node版本大于6

## 使用方法

### 获取code所需的redirect_url，已经encode
```
var wxoauth = require('./lib/oauth')
var redirect_url = new wxoauth.wechatOAuth(params).getRedirectUrl();
return res.redirect(redirect_url);
```

```
params = {
	redirect_url: REDIRECTURL,  // 回调地址
	app_id: APPID // appid
}
```

### 获取userinfo
1、scope: snsapi_base
2、scope: snsapi_userinfo

```
new wxoauth.wechatOAuth(params).getAccessToken();
```

Tips：scope为base时，getAccessToken执行完返回数据；scope为userinfo时，执行完getAccessToken后会继续执行getUserInfo方法获取到用户信息后再返回数据

```
params = {
	app_id: APPID, // appid
	app_secret: APPSECRET, // appsecret
	callback: callback(result), // 业务代码函数，返回openid&用户信息
	scope: snsapi_base/snsapi_userinfo, // 可选，默认snsapi_userinfo
	code: code // 从微信获取的code
}
```
例子：
```
var express = require('express');
var router = express.Router();

var wxoauth = require('wx-oauth-base');

var config = {
	appid: xxx,
	appsecret: xxx
}
router.get('/wxoauth', function (req, res) {
	if (req.query.code) {
		var redirect_uri = new wxoauth.wechatOAuth({app_id: config.appid, redirect_url: xxxx}).getRedirectUrl();
		return res.redirect(redirect_uri)
	} else {
		new wxoauth.wechatOAuth({
			app_id: config.appid,
			app_secret: config.appsecret,
			code: req.query.code,
			scope: snsapi_base,
			callback: function (response) { /* do something */}
		}).getAccessToken();
	}
})
```