var request = require('superagent');

var wechatOAuth = function (options) {
  var opt = options || {};

  if (!opt.app_id) {
    this.throwError("没有app_id");
  }

  if (!opt.scope) {
    opt.scope = 'snsapi_userinfo';
  }

  this.data = opt;
};

function requestGET(url, data, callback) {
  request
    .get(url)
    .query(data)
    .end(function (err, res) {
      if (err) { throw new Error(err) }
      callback(res);
    })
}

wechatOAuth.prototype.sendData = function (data) {
  var callback = this.data.callback;
  if (typeof callback === "function") {
    callback(data)
  } else {
    this.throwError(err.errmsg);
  }
}

wechatOAuth.prototype.throwError = function (msg) {
  throw new Error(msg);
}

wechatOAuth.prototype.getRedirectUrl = function () {

  if (!this.data.redirect_url) {
    this.throwError("没有code且没有重定向地址获取code");
  }

  var app_id = this.data.app_id;
  var url = this.data.redirect_url;

  var redirect = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + app_id + '&redirect_uri=' + encodeURIComponent(url) + '&response_type=code&scope=' + this.data.scope + '&state=ZJKT666#wechat_redirect';

  return redirect;
}

wechatOAuth.prototype.getAccessToken = function () {

  if (!this.data.app_secret) {
    this.sendData({ errmsg: "没有app_secret" });
  }

  if (!this.data.code) {
    this.sendData({ errmsg: "没有code，请先调用getCode方法获取code" });
  }

  var self = this;
  var url = 'https://api.weixin.qq.com/sns/oauth2/access_token';

  var data = {
    appid: self.data.app_id,
    secret: self.data.app_secret,
    code: self.data.code,
    grant_type: 'authorization_code'
  };

  requestGET(url, data, function (res) {

    var result = {};

    if (res.text.match("^\{(.+:.+,*){1,}\}$")) {

      result = JSON.parse(res.text);

      if (result.errmsg || self.data.scope == 'snsapi_base') {
        // 静默授权到此结束，返回数据&这一步报错时也一起返回错误，不继续执行
        self.sendData(result)

      } else {
        // 获取用户信息
        self.getUserInfo(result);

      }
    } else {

      result = { errmsg: "数据格式不是json" }

      self.sendData(result)
    }

  });
}

wechatOAuth.prototype.getUserInfo = function (data) {
  // 获取用户信息，
  var self = this;
  var url = 'https://api.weixin.qq.com/sns/userinfo';

  if (!data.access_token || !data.openid) {

    self.sendData({ errmsg: '缺少参数' });
    
  } else {

    var params = {
      access_token: data.access_token,
      openid: data.openid,
      lang: 'zh_CN'
    };

    requestGET(url, params, function (res) {

      if (res.text.match("^\{(.+:.+,*){1,}\}$")) {

        result = JSON.parse(res.text);

      } else {

        result = { errmsg: "数据格式不是json" };

      }

      self.sendData(result);

    });

  }
}

wechatOAuth.prototype.accessTokenCanUse = function () { }

wechatOAuth.prototype.refershAccessToken = function () { }

exports.wechatOAuth = wechatOAuth;