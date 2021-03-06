'use strict';

var miniprofiler = require('../../../lib/miniprofiler.js');
var koa = require('koa');
var route = require('koa-route');

var app = koa();

var options = {
  enable: (req) => {
    return false;
  }
};

app.use(miniprofiler.koa(options));

app.use(route.get('/', function *(){
  yield new Promise((resolve, reject) => {
    this.req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, () => {
      this.req.miniprofiler.step('Step 1', () => {
        this.body = this.state.miniprofiler.include();
        resolve();
      });
    }, 50);
  });
}));

module.exports = app;
