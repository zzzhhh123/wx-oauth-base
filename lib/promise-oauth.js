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

function requestGET(url, data) {
  return new Promise(function (resolve, reject) {
    request
      .get(url)
      .query(data)
      .end(function (err, res) {
        if (err) {
          reject(err) 
        } else {
          resolve(res)
        }
      })
  });
}

function requestPOST(url, data) {
  return new Promise(function (resolve, reject) {
    request
      .post(url)
      .send(data)
      .end(function (err, res) {
        if (err) {
          reject(err)
        } else {
          resolve(res)
        }
      })
  });
}

wechatOAuth.prototype.throwError = function (msg) {
  throw new Error(msg);
}

wechatOAuth.prototype.getRedirectUrl = function () {
  if (!this.data.host_url) {
    this.throwError("没有code且没有重定向地址获取code");
  }
  let app_id = this.data.app_id;
  let host_url = this.data.host_url;
  var redirectUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${app_id}&redirect_uri=${encodeURIComponent(host_url)}&response_type=code&scope=${this.data.scope}&state=ZJKT666#wechat_redirect`
  return redirectUrl;
}

wechatOAuth.prototype.getAccessToken = function () {
  if (!this.data.app_secret) {
    this.throwError("没有app_secret");
  }
  if (!this.data.code) {
    this.throwError("没有code，请先调用getCode方法获取code");
  }
  var self = this;
  var url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
  var data = {
    appid: self.data.app_id,
    secret: self.data.app_secret,
    code: self.data.code,
    grant_type: 'authorization_code'
  };
  return new Promise(function (resolve, reject) {
    requestGET(url, data)
      .then(function (res) {
        var result = "";
        if (res.text.match("^\{(.+:.+,*){1,}\}$")) {
          result = JSON.parse(res.text);
          if (self.data.scope == 'snsapi_base') { // 静默授权处理结束
            resolve(result);
          } else { // 弹框授权-获取用户信息
            self.getUserInfo(result)
              .then(resp => {
                resolve(resp);
              })
              .catch(err => {
                reject(err);
              });
          }
        } else {
          result = { errmsg: "数据格式不是json" };
          reject(result);
        }
      })
      .catch(function (err) {
        reject(err);
      })
    })
}

wechatOAuth.prototype.getUserInfo = function (data) {
  // 通过
  var url = 'https://api.weixin.qq.com/sns/userinfo';
  var params = {
    access_token: data.access_token,
    openid: data.openid,
    lang: 'zh_CN'
  };
  return new Promise(function (resolve, reject) {
    requestGET(url, params)
      .then(function (res) {
        var result = {};
        if (res.text.match("^\{(.+:.+,*){1,}\}$")) {
          result = JSON.parse(res.text);
          resolve(result)
        } else {
          result = { errmsg: "数据格式不是json" };
          reject(result);
        }
      })
      .catch(function (err) {
        reject(result);
      })
  })
}

wechatOAuth.prototype.accessTokenCanUse = function () {}

wechatOAuth.prototype.refershAccessToken = function () {}

exports.wechatOAuth = wechatOAuth;
