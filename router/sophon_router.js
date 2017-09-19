/**
 * Created by nihaitong on 2017/7/3.
 */

var router = new require('koa-router')({
  prefix: '/qa'
});
var domainQuery = require('../controllers/sophon/domainQuery');
var lineQuery = require('../controllers/sophon/lineQuery');
var certQuery = require('../controllers/sophon/certQuery');
var domainOperate = require('../controllers/sophon/domainOperate');
var tool = require('../controllers/sophon/tool');

//域名查询模块
router.post('/query/domain/filter', domainQuery.filter);
router.get('/query/domain/detail', domainQuery.detail);
router.get('/query/domain/test', domainQuery.test);
router.post('/query/line/filter', lineQuery.filter);
router.get('/query/line/filing', lineQuery.filing);
router.post('/query/cert/order', certQuery.order);
router.post('/query/cert/cert', certQuery.cert);

//批量操作模块
router.post('/batch/operate/otherAct', domainOperate.otherAct);

//工具模块
router.post('/tool/debug', tool.debug);

module.exports = router;