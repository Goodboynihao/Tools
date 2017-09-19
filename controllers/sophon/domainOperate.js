/**
 * Created by nihaitong on 2017/7/11.
 */
var http = require('../../config/http');
var mongo = require('../../config/mongo');


var batchAction = async (action, domain, body)=>{
  let res;
  switch (action){
    case 'offLine':
      res = await http.post('/v2/admin/domains/' + domain.name + '/offline', {
        'uid': domain.uid,
        'force': true,
        'message': 'test'
      });
      break;
    case 'httpsUp':
      res = await http.post('/api/v1/admin/domains/' + domain.name + '／sslize', {
        keepMidSourceState: body['keepMid'],
        useUserChain: false,
        certId: body['certId']
      }
      );
      break;
    case 'httpsDown':
      res = await http.post('/api/v1/admin/domains/' + domain.name + '／unsslize', {
        "keepMidSourceState":true
      }
      );
      break;
    case 'delete':
      res = await http.delete('/api/v1/admin/domains/' + domain, {});
      break;
    case 'timeACLOpen':
      res = await http.post('/api/v1/domains/' + domain.name + '/timeacl', {
        timeACL: true,
        timeACLKeys: [
          'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
          'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
        ]
      });
      break;
    case 'timeACLClose':
      res = await http.post('/api/v1/domains/' + domain.name + '/timeacl', {
        timeACL: false,
        timeACLKeys: []
      });
      break;
    case 'source':
      res = await http.post('/api/v1/domains/' + domain.name + '/syncmidsrc', {});
      break;
    case 'sourceOnLine':
      let addr = await mongo.find.domain({
        name: domain
      }, {
        midSource: 1
      })[0]['midSource']['addrs'];
      res = await http.post('/api/v1/domains/' + domain.name + '/midsource/switch', {
        enabled: true,
        addrs: addr
      });
      break;
    case 'sourceOffLine':
      res = await http.post('/api/v1/domains/' + domain.name + '/midsource/switch', {
        enabled: false
      });
      break;
    case 'freeze':
      res = await http.post('/api/v1/domains/' + domain.name + '/freeze', {
        name: domain,
        message: body['reason']
      });
      break;
    case 'unfreeze':
      res = await http.post('/api/v1/domains/' + domain.name + '/unfreeze', {
        name: domain,
        message: body['reason']
      });
      break;
    case 'clear':
      res = await http.post('/api/v1/domains/' + domain.name + '/clear', {
        offlineCdn: [body['line']]
      });
      break;
    default: break;
  }
  console.log(res);
  if (res['code'] !== 200){
    return {
      result: 0,
      reason: res
    };
  }
  else{
    return {
      result: 1
    };
  }
}


module.exports = {
  otherAct: async (ctx)=>{
    let action = ctx.request.body.action,
        domains = ctx.request.body.domains || [],
        uids = ctx.request.body.uids || [];
    for (let x in domains){
      if (!domains[x]){
        domains.splice(x, 1);
      }
    }
    for (let y in uids){
      if (!uids[y]){
        uids.splice(y, 1);
      }
    }
    if (uids.length === 0 && domains.length === 0){
      ctx.response.body = {
        error: '没有填写可操作的域名或UID'
      }
    }
    else{
      let params = {};
      params['certId'] = ctx.request.body.certId || '';
      params['address'] = ctx.request.body.address || '';
      params['line'] = ctx.request.body.line || '';
      params['keepMid'] = ctx.request.body.keepMid || false;
      params['reason'] = ctx.request.body.reason || '';
      if (uids.length !== 0){
        domains = [];
        for (let x in uids){
          let res = await mongo.find.domain({uid: uids[x]}, {uid:1, name: 1});
          if (res.length !== 0){
            domains.concat(res);
          }
        }
      }
      else{
        domains = await mongo.find.domain({name: {$in: domains}}, {uid:1, name: 1});
      }
      if (domains.length === 0){
        ctx.response.body = {
          data: '没有可用的域名'
        }
      }
      else{
        let body = {
          code: 200,
          data: []
        };
        for (let x in domains){
          let res = batchAction(action, domains[x], params);
          if (res['result'] === 1){
            body['data'].push({
              domain: domains[x]['name'],
              status: 'success',
              uid: domains[x]['uid']
            })
          }
          else{
            body['data'].push({
              domain: domains[x]['name'],
              status: 'fail',
              uid: domains[x]['uid']
            })
          }
        }
        ctx.response.body = body;
      }
    }
  }
}