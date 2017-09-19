/**
 * Created by nihaitong on 2017/8/13.
 */

var router = new require('koa-router')({
  prefix: '/v1'
});

var log = require('../controllers/deftones/logs');
var domain = require('../controllers/deftones/domains');
var bandwidth = require('../controllers/deftones/bandwidths');
var test = require('../controllers/deftones/tests');

router.post('/:provider/hour/logs', log.link);
router.get('/:provider/all/domains', domain.domain);
router.post('/:provider/bandwidth', bandwidth.bandwidth);
router.post('/test', test.test);
router.post('/result', test.query);

module.exports = router;