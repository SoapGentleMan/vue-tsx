const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');

const app = express();        //实例化express
app.use(compression({
  threshold: 0
}));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE,HEAD');
  next()
});

app.all('/data', (req, res) => {
  // 要啥require啥
  const data=  JSON.parse(fs.readFileSync(path.resolve('./data.json'), 'utf-8'))
  res.json(data)
});

app.all('/', (req, res) => {
  res.send('请指定路径访问')
});

app.listen('8081', () => {
  console.log('地址： http://127.0.0.1:8080, 请转发到这个地址，带上路径' )
});
