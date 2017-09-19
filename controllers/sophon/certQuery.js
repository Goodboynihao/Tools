/**
 * Created by nihaitong on 2017/7/11.
 */
var http = require('../../config/http');
var mongo = require('../../config/mongo');


module.exports = {
  order: async (ctx) => {
    let params = {};
    params['state'] = ctx.request.body.status || 0;
    params['product_short_name'] = ctx.request.body.product|| '';
    params['encrypt'] = ctx.request.body.encrypt || '';
    params['auth_method'] = ctx.request.body.auth || '';
    params['_id'] = ctx.request.body.orderId || '';
    params['uid'] = ctx.request.body.uid || 0;
    params['user_info.org_organization_name'] = ctx.request.body.company || '';
    params['common_name'] = ctx.request.body.commonName || '';
    params['begin_date'] = ctx.request.body.date[0] || '';
    params['end_date'] = ctx.request.body.date[1] || '';
    params['provider_orderid'] = ctx.request.body.provider_orderid || '';
    let match = {};
    let fixed = ['state', 'product_short_name', 'encrypt', 'auth_method', '_id', 'uid', 'provider_orderid'];
    for (let x in fixed) {
      if (params[fixed[x]] !== '' && params[fixed[x]] !== 0) {
        match[fixed[x]] = params[fixed[x]]
      }
    }
    if (params['user_info.org_organization_name'] !== '') {
      match['user_info.org_organization_name'] = {
        $regex: params['user_info.org_organization_name']
      }
    }
    if (params['common_name'] !== '') {
      match['common_name'] = {
        $regex: params['common_name']
      }
    }
    if (params['begin_date'] !== ''){
      match['create_time'] = {
        $gte: new Date(params['begin_date']),
        $lte: new Date(params['end_date'])
      };
    }
    let res = await mongo.aggregate.sslcertOrder([{$match: match}, {$sort:{"create_time":-1}}, {$limit: 20}]);
    if (res !== undefined){
      ctx.response.body = {
        code: 200,
        data: res,
      };
    }
  },
  cert:async (ctx) => {
    let params = {};
    params['_id'] = ctx.request.body.certId || '';
    params['product_short_name'] = ctx.request.body.product_short_name|| '';
    params['orderId'] = ctx.request.body.orderId || '';
    params['match'] = ctx.request.body.match || '';
    params['uid'] = ctx.request.body.uid || 0;
    params['common_name'] = ctx.request.body.common_name || '';
    params['name'] = ctx.request.body.name|| '';
    params['date_create_begin'] = ctx.request.body.date_create[0] || '';
    params['date_create_end'] = ctx.request.body.date_create[1] || '';
    params['date_expire_begin'] = ctx.request.body.date_expire[0] || '';
    params['date_expire_end'] = ctx.request.body.date_expire[1] || '';
    let match = {};
    let fixed = ['_id', 'orderId', 'uid'];
    for (let x in fixed) {
      if (params[fixed[x]] !== '' && params[fixed[x]] !== 0) {
        match[fixed[x]] = params[fixed[x]]
      }
    }
    if (params['product_short_name'] === 'USER'){
      match['product_short_name'] = '';
    }
    else if (params['product_short_name'] !== ''){
      match['product_short_name'] = params['product_short_name'];
    }
    let regexed = ['common_name', 'name', 'match'];
    for (let x in regexed) {
      if (params[regexed[x]] !== '' && params[regexed[x]] !== 0) {
        if (params[regexed[x]] === '*'){
          match[regexed[x]] = {
            $regex: '\\*'
          }
        }
        else {
          match[regexed[x]] = {
            $regex: params[regexed[x]]
          }
        }
      }
    }
    if (params['date_create_begin'] !== ''){
      match['create_time'] = {
        $gte: new Date(params['date_create_begin']),
        $lte: new Date(params['date_create_end'])
      };
    }
    if (params['date_expire_begin'] !== ''){
      match['not_after'] = {
        $gte: new Date(params['date_expire_begin']),
        $lte: new Date(params['date_expire_end'])
      };
    }
    if (ctx.request.body.hide === true){
      match['enable'] = true;
    }
    let project = {
      _id: 1,
      uid: 1,
      name: 1,
      orderid: 1,
      common_name: 1,
      create_time: 1,
      not_after: 1,
      provider_orderid: 1,
      product_short_name: 1,
      match: 1
    };
    if (match === {}){
      match = {
        product_short_name: {
          regexed: '\\*'
        }
      };
    }
    let res = await mongo.aggregate.sslcertCert([{$match: match}, {$sort:{"create_time":-1}}, {$project: project}, {$limit: 20}]);
    if (res !== undefined){
      ctx.response.body = {
        code: 200,
        data: res,
      };
    }
  }
};