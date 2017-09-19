/**
 * Created by nihaitong on 2017/7/27.
 */

const AK = '4_odedBxmrAHiu4Y0Qp0HPG0NANCf6VAsAjWL_k9';
const SK = 'SrRuUVfDX6drVRvpyN8mv8Vcm9XnMZzlbDfvVfMe';

var crypto = require('crypto');
var url = require('url');


var base64ToUrlSafe = function(v) {
  return v.replace(/\//g, '_').replace(/\+/g, '-');
}

var hmacSha1 = function(encodedFlags, secretKey) {
  let hmac = crypto.createHmac('sha1', secretKey);
  hmac.update(encodedFlags);
  return hmac.digest('base64');
}

exports.generateAccessToken = function(requestURI) {
  let access = url.parse(requestURI).path + '\n';
  let digest = hmacSha1(access, SK);
  let safeDigest = base64ToUrlSafe(digest);
  return 'QBox ' + AK + ':' + safeDigest;
}
