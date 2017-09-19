/**
 * Created by nihaitong on 2017/9/19.
 */
/**
 * Created by nihaitong on 2017/7/8.
 */
var http = require('../../config/http');
var request = require('request');


module.exports = {
  debug: async (ctx) => {
    let
      method = ctx.request.body.method || '',
      protocol = ctx.request.body.protocol || '',
      host = ctx.request.body.host || '',
      uri = ctx.request.body.uri || '',
      type = ctx.request.body.type,
      ak = ctx.request.body.ak,
      sk = ctx.request.body.sk,
      body = ctx.request.body.body;

    let buckets = new Promise((resolve, reject) => {
      request.del(options(url, body, 'DELETE', host), function (error, response, body) {
        resolve(responseExe(error, response, body));
      });
    })
    if (buckets.length === 0){
      ctx.response.body = {
        "error": "该用户没有存储空间!"
      };
      return;
    }
    let num = parseInt(ctx.request.body.privateVal);
    for (let x in buckets){
      if (buckets[x]['private'] === num){
        useBuckets.push(buckets[x]['name']);
      }
    }
    if (useBuckets.length === 0){
      ctx.response.body = {
        "error": "没有此类存储空间!"
      };
      return;
    }
  },
  info: async (ctx)=>{
    let lineId = ctx.query.lineId || '',
      mail = ctx.query.mail || '',
      condition = {};
    if (lineId === '' && mail === ''){
      ctx.response.body = {
        data: 'Parameter Error'
      }
      return;
    }
    if (lineId !== '') {
      condition['lineIds'] = {
        $all: [lineId]
      };
    }
    if (mail !== ''){
      condition['account'] = {
        $regex: mail
      };
    }
    let  filingRes = await mongo.find.filing(condition);
    if (filingRes === undefined){
      ctx.response.body = {
        data: 'Mongo Error'
      };
    }
    else if (filingRes.length === 0) {
      ctx.response.body = {
        data: 'No comfortable data'
      };
    }
    else {
      let res = [];
      let lineIds = [];
      if (lineId === ''){
        for (let x in filingRes){
          for (let y in filingRes[x]['lineIds']){
            lineIds.push(filingRes[x]['lineIds'][y]);
            res.push({
              lineName: filingRes[x]['lineIds'][y],
              uid: filingRes[x]['uid'],
              domain: filingRes[x]['domain'],
              account: filingRes[x]['account']
            });
          }
        }
      }
      else{
        for (let x in filingRes){
          lineIds = [lineId];
          res.push({
            lineName: lineId,
            uid: filingRes[x]['uid'],
            domain: filingRes[x]['domain'],
            account: filingRes[x]['account']
          });
        }
      }
      let lineNames = await mongo.find.line({
        _id: {
          $in: lineIds
        }}, {name:1});
      let lineMap = {};
      for (let x in lineNames){
        lineMap[lineNames[x]['_id']] = lineNames[x]['name'];
      }
      for (let x in res){
        res[x]['lineName'] = lineMap[res[x]['lineName']];
      }
      ctx.response.body = {
        code: 200,
        data: res
      }
    }
  }
};