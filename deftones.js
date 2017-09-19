/**
 * Created by nihaitong on 2017/8/13.
 */
const koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');
const onerror = require('koa-onerror');
const staticServer = require('koa-static');
const path = require('path');

const router = require('./router/deftones_router');

const app = new koa();
onerror(app);
app.use(staticServer(path.join(__dirname, 'static')));
app.use(logger());

app.use(bodyParser());
app.use(cors({
  'origin': '*',
  'headers': 'Content-Type,Authorization',
  'credentials': true,
  'expose': 'WWW-Authenticate,Server-Authorization',
  'Access-Control-Allow-Origin': '*'
}));
app.use(router.routes());

app.listen(8889);
