const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');

const app = express();
app.use(compression({
  threshold: 0
}));

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  res.header('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE,HEAD');
  if (req.method.toLowerCase() === 'options') {
    return res.sendStatus(200)
  }
  let data;
  if (!req.path.match(/login|logout/) && !req.headers.authorization) {
    data = JSON.parse(fs.readFileSync(path.resolve(__dirname, './data/no-login.json'), 'utf-8'))
  } else {
    const filename = req.path.split('/').reverse()[0];
    data = JSON.parse(fs.readFileSync(path.resolve(__dirname, `./data/${filename}.json`), 'utf-8'))
  }
  setTimeout(() => res.json(data), 1000)
});

app.all('/', (req, res) => {
  res.send('请指定路径访问')
});

app.listen('8081', () => {
  console.log('地址： http://127.0.0.1:8081, 请转发到这个地址，带上路径' )
});
