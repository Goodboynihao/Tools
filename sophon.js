const koa = require('koa');
const cors = require('koa-cors');
const bodyParser = require('koa-bodyparser');
const logger = require('koa-logger');

const router = require('./router/sophon_router');
const convert = require('koa-convert');

const app = new koa();
app.use(logger());

app.use(bodyParser());
app.use(convert(cors({
  'origin': '*',
  'headers': 'Content-Type,Authorization',
  'credentials': true,
  'expose': 'WWW-Authenticate,Server-Authorization',
  'Access-Control-Allow-Origin': '*'
})));
app.use(router.routes());

app.listen(8888);
