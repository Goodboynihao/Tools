/**
 * Created by nihaitong on 2017/7/8.
 */
var http = require('../../config/http');
var mongo = require('../../config/mongo');
const FEATURE_MAP = {
  'timeacl':'5714b01de3ab3a4b6d00001a',
  'wildcard': '57442202e3ab3a3aca000011',
  'http2.0': '58de2436e3ab3a143c000001',
  'ecccert': '593fe1e045e6b06faf64276a',
  'originauth': '58de2477e3ab3a143c000002'
}


module.exports = {
  filter: async (ctx) => {
    let
      lineType = ctx.request.body.lineType || '',
      geoCover = ctx.request.body.geoCover || '',
      cdnProvider = ctx.request.body.cdnProvider || '',
      platform = ctx.request.body.platform || '';
    if (lineType === '') {
      ctx.response.body = {
        "code": 10000
      };
    }
    else {
      let checkList = {};
      if (lineType === 'base' || lineType === 'fusion'){
         checkList['wildcard'] = ctx.request.body.wildcard || '';
         checkList['ecccert'] = ctx.request.body.ecccert || '';
         checkList['http2.0'] = ctx.request.body.http2 || '';
         checkList['originauth'] = ctx.request.body.originauth || '';
         checkList['timeacl'] = ctx.request.body.timeacl || '';
      }
      if (lineType === 'fusion' || lineType === 'global'){
        var defaultLine = ctx.request.body.defaultLine || '',
            containLine = ctx.request.body.containLine || ''
      }
      let protocol = ctx.request.body.protocol || 0,
          vendor = ctx.request.body.vendor || 0;

      let condition = {
        "type": lineType
      };
      if (platform !== ''){
        condition['platform'] = platform;
      }
      if (lineType === 'base' && cdnProvider !== ''){
        condition['cdnProvider'] = cdnProvider;
      }
      if ((lineType === 'base' || lineType === 'fusion') && geoCover !== ''){
        condition['geoCover'] = geoCover;
      }
      if (protocol !== 0){
        condition['protocol'] = protocol;
      }
      if (vendor !== 0){
        condition['vendor'] = vendor;
      }
      let featureIds = {
        'in': [],
        'nin': []
      };
      for (let x in checkList){
        if (checkList[x] === '0'){
          featureIds['in'].push(FEATURE_MAP[x]);
        }
        if (checkList[x] === '1'){
          featureIds['nin'].push(FEATURE_MAP[x]);
        }
      }
      if (featureIds['in'].length !== 0){
          condition['featureIds'] = {
            $all: featureIds['in']
          };
      }
      else if (featureIds['nin'].length !== 0){
        condition['featureIds'] = {
          $nin: featureIds['nin']
        };
      }

      let lineRes = await mongo.find.line(condition);
      if(lineRes === undefined){
        ctx.response.body = {
          data: 'Mongo Error'
        };
      }
      else{
        let data = [],
            lContain = false,
             lDefault = false;

        if (lineType === 'fusion' || lineType === 'global'){
          if (containLine !== '' && defaultLine !== ''){
            for (let x in lineRes){
              lContain = false;
              lDefault = false;
              let subLine = lineRes[x]['subLineInfos'];
              for (let y in subLine){
                if (subLine[y]['cdnProvider'] === containLine){
                  lContain = true;
                }
                if (subLine[y]['default'] === true && subLine[y]['cdnProvider'] === defaultLine){
                  lDefault = true;
                }
              }
              if (lContain === true && lDefault === true){
                data.push(lineRes[x]);
              }
            }
          }
          else if (containLine !== ''){
            for (let x in lineRes){
              lContain = false;
              let subLine = lineRes[x]['subLineInfos'];
              for (let y in subLine){
                if (subLine[y]['cdnProvider'] === containLine){
                  lContain = true;
                }
              }
              if (lContain === true){
                data.push(lineRes[x]);
              }
            }
          }
          else if (defaultLine !== ''){
            for (let x in lineRes){
              lDefault = false;
              let subLine = lineRes[x]['subLineInfos'];
              for (let y in subLine){
                if (subLine[y]['default'] === true && subLine[y]['cdnProvider'] === defaultLine){
                  lDefault = true;
                }
              }
              if (lDefault === true){
                data.push(lineRes[x]);
              }
            }
          }
          else {
            data = lineRes;
          }
        }
        else{
          data = lineRes;
        }

        console.log(featureIds);
        let bodyData = [];
        for(let x in data){
          let filter = true;
          for(let y in featureIds['nin']){
            if(data[x]['featureIds'].indexOf(featureIds['nin'][y]) !== -1){
              filter = false;
              break;
            }
          }
          if(filter === true){
            bodyData.push(data[x]);
          }
        }

        ctx.response.body = {
          code: 200,
          data: bodyData
        };
      }
    }
  },
  filing: async (ctx)=>{
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