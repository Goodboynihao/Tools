/**
 * Created by nihaitong on 2017/7/6.
 */
var request = require('request');
var auth = require('../config/auth');

const HOST = {
  domain: 'http://10.200.20.27:16000',
  cdn: 'http://10.200.20.27:16020'
};

//const host = 'http://fulichao.fusiondomain.fusion.spocktest.qiniu.io';

var options = (url, params, method, host)=>{
  host = HOST[host];
  let headers = {
    'Referer': host,
    'Authorization': auth.generateAccessToken(url),
    'Account': 'qboxtest@qiniu.com'
  };
  if(method === 'GET'){
    return {
      method: 'GET',
      url: host + url,
      headers: headers,
      qs: params,
      json: true,
      timeout: 20000
    }
  }
  else if(method === 'POST'){
    return {
      method: 'POST',
      url: host + url,
      headers: headers,
      body: params,
      json: true,
      timeout: 10000
    }
  }
  else if (method === 'DELETE'){
    return {
      method: 'DELETE',
      url: host + url,
      headers: headers,
      body: params,
      json: true,
      timeout: 10000
    }
  }
  else{
    return {
      url: host + url,
      headers: headers,
      qs: params,
      json: true,
      timeout: 10000
    }
  }
}

var responseExe = (error, response, body)=>{
  if (response === undefined){
    return {
      'error': '网络错误'
    }
  }
  if(response.statusCode !== 200){
    return {
      'error': '服务器错误'
    }
  }
  else{
    if(body['code'] !== 200 && body['code'] !== undefined){
       return {
         'error': 'fusion服务报错',
         'data': body
      }
    }
    else{
      return body;
    }
  }
}

module.exports = {
  get: (url, qs, host='domain') => {
    return new Promise( (resolve, reject)=> {
      request.get(options(url, qs, 'GET', host), function (error, response, body) {
        resolve(responseExe(error, response, body));
      });
    })
  },
  post: (url, body, host='domain') => {
    return new Promise((resolve, reject) => {
      request.post(options(url, body, 'POST', host), function (error, response, body) {
        resolve(responseExe(error, response, body));
      });
    })
  },
  delete: (url, body, host='domain') => {
    return new Promise((resolve, reject) => {
      request.del(options(url, body, 'DELETE', host), function (error, response, body) {
        resolve(responseExe(error, response, body));
      });
    })
  }
}
