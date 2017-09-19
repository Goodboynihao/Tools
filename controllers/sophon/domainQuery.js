  /**
  * Created by nihaitong on 2017/7/3.
  */
var http = require('../../config/http');
var mongo = require('../../config/mongo');

const VALUE = {'0': false, '1': true};


var searchDomains = async (domain, domainType, lineIds, buckets, ctx) => {
  let timeacl = ctx.request.body.timeacl,
      bsauth = ctx.request.body.bsauth,
      midsource = ctx.request.body.midsource,
      referer = ctx.request.body.referer;
  let match = {};
  if (timeacl !== '') {
    match['timeACL'] = VALUE[timeacl];
  }
  if (bsauth !== '') {
    match['bsauth.enable'] = VALUE[bsauth];
  }
  if (midsource !== ''){
    match['midSource.enabled'] = VALUE[midsource];
  }
  if (referer !== ''){
    if(referer === '1'){
      match['$or'] = [
        {'refererType': 'white'},
        {'refererType': 'black'}
      ]
    }
    else{
      match['refererType'] = '';
    }
  }
  if (ctx.request.body.protocol !== 0){
    match['protocol'] = ctx.request.body.protocol;
  }
  if (ctx.request.body.sourceType !== ''){
    match['sourceType'] = ctx.request.body.sourceType;
  }
  if (ctx.request.body.uid !== ''){
    match['uid'] = parseInt(ctx.request.body.uid);
  }
  if (ctx.request.body.state !== ''){
    match['state'] = ctx.request.body.state;
  }
  if (domain !== ''){
    match['name'] = {
      $regex: domain
    }
  }
  match['lineId'] = {
    $in: lineIds
  }
  if (buckets.length !== 0){
    match['sourceType'] = "qiniuBucket";
    match['sourceQiniuBucket'] = {
      $in: buckets
    };
  }
  console.log(match);
  if (domainType === 'normal' || domainType === 'wildcard'){
    match['type'] = domainType;
    return await mongo.aggregate.domain([{$match: match}, {$project: {'name':1, 'cname':1, 'lineId':1, 'sourceQiniuBucket':1, 'state':1}}, {$limit:100}]);
  }
  else{
    match['type'] = 'wildcard';
    let res = await mongo.aggregate.domain([{$match: match}, {$project: {'name':1}}]);
    let pareDomains = [];
    for (let x in res){
      pareDomains.push(res[x]['name']);
    }
    if (pareDomains.length !== 0){
      let condition = {
        pareDomain: {
          $in: pareDomains
        },
        type: domainType
      }
      return await mongo.find.domain(condition, {'name':1, 'cname':1, 'lineId':1, 'sourceQiniuBucket':1, state:1, $limit:100});
    }
    else{
      return [];
    }
  }
}


module.exports = {
  filter: async (ctx) => {
    let
      lineType = ctx.request.body.lineType || '',
      geoCover = ctx.request.body.geoCover || '',
      cdnProvider = ctx.request.body.cdnProvider || '',
      platform = ctx.request.body.platform || '',
      domainType = ctx.request.body.domainType || '';
    if (lineType === '' || domainType === '') {
      ctx.response.body = {
        'error': '线路类型或者域名类型没有选择'
      };
    }
    else {
      let domain = ctx.request.body.domain || '';
      if (domain !== '') {
        ctx.response.body = {
          'error': '没有填写过滤条件'
        };
      }
      else {
        let condition = {
          'type': lineType,
          'platform': platform === ''?{$regex: '\/*'}:platform,
          'cdnProvider': cdnProvider === ''?{$regex: '\/*'}:cdnProvider,
          'geoCover': geoCover === ''?{$regex: '\/*'}:geoCover
        }
        let lineRes = await mongo.find.line(condition, {"_id": 1, name:1});
        if(lineRes === undefined){
          ctx.response.body = {
            "error": 'Mongo Error'
          };
          return;
        }
        let lineIds = [];
        for (let x in lineRes){
          lineIds.push(lineRes[x]['_id']);
        }
        if (lineIds.length === 0){
          ctx.response.body = {
            "error": "No comfortable line!"
          }
          return;
        }
        let useBuckets = [];
        if (ctx.request.body.privateVal !== ''){
          let buckets = await http.get('/v3/admin/buckets/' + ctx.request.body.uid, {}, 'domain');
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
        }
        let domains = await searchDomains(domain, domainType, lineIds, useBuckets, ctx);
        if (domains.length === 0){
          ctx.response.body = {
            "error": "No Domain!"
          };
        }
        else{
          let lineMap = {};
          for (let y in lineRes){
            lineMap[lineRes[y]['_id']] = lineRes[y]['name'];
          }
          for (let x in domains){
            domains[x]['lineName'] = lineMap[domains[x]['lineId']];
          }
          ctx.response.body = {
            "code": 200,
            "data": domains
          };
        }
      }
    }
  },
  detail: async (ctx)=>{
    let domain = ctx.query.domain || '';
    if (domain === '' || domain === 'undefined'){
      ctx.response.body = {
        error: 'Domain Input Error!'
      }
    }
    else {
      let content = ctx.query.content || '';
      if (content === 'detail' || content === ''){
        let domainDetail = await mongo.find.domain({name: domain});
        if (domainDetail.length === 0){
          ctx.response.body = {
            'error': '该域名不存在'
          };
        }
        else{
          ctx.response.body = {
            code: 200,
            data: {
              domainDetail: domainDetail
            }
          }
        }
      }
      else if (content === 'config'){
        let cdnProvider = ctx.query.provider || '';
        if (cdnProvider === '' || cdnProvider === 'all'){
          ctx.response.body = {
            code: 200,
            data: {
              domainConf: {'error': '查询无效'}
            }
          }
        }
        let domainConf = await http.get('/v3/domains/' + domain + '?cdnProvider=' + cdnProvider, {}, 'cdn');
        if (Array.isArray(domainConf)){
          if (domainConf.length === 0){
            ctx.response.body = {
              code: 200,
              data: {
                domainConf: {'error': '没有查到厂商记录'}
              }
            }
          }
          else{
            ctx.response.body = {
              code: 200,
              data: {
                domainConf: domainConf
              }
            }
          }
        }
        else{
          ctx.response.body = {
            code: 200,
            data: {
              domainConf: {'error':'查询厂商记录失败'}
            }
          }
        }
      }
      else{
        ctx.response.body = {
          'error': '无效的查询内容'
        };
      }
    }
  },
  test: async (ctx) => {
    let domain = ctx.query.domain;
    let testType = ctx.query.testType;
    let res = await mongo.aggregate.domainTest([{$match:{'createArgs.domain': {$regex: domain}, 'createArgs.testtype': testType}}, {$sort:{'createAt':-1}}, {$project:{'createArgs':1, '_id':1, 'status':1,'createAt':1}}, {$limit: 20}]);
    if (res !== undefined){
      if (res.length === 0){
        ctx.response.body = {
          code: 10000,
          data: '没有数据'
        };
      }
      else{
        ctx.response.body = {
          code: 200,
          data: res,
        };
      }
    }
  }
};