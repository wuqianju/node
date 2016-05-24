var miniprofiler = require('../lib/miniprofiler.js');
var pg = require('pg');
var redis = require('redis');

var express = require('express');
var connString = 'postgres://postgres:postgres@localhost/miniprofiler';

var app = express();
app.use(miniprofiler.express());
app.use(miniprofiler.for.pg(pg));
app.use(miniprofiler.for.redis(redis));

app.set('view engine', 'pug');
app.set('views', './examples/views');

app.get('/', function(req, res) {
  req.miniprofiler.step('Step 1', function() {
    req.miniprofiler.step('Step 2', function() {
      res.render('home');
    });
  });
});

app.get('/js-sleep', function(req, res) {
	req.miniprofiler.timeQuery('custom', 'Sleeping...', setTimeout, function() {
		res.send();
	}, 300);
});

app.get('/redis-set-get', function(req, res) {
	var redisClient = redis.createClient();
  redisClient.set('customer', 'john@domain.com', function() {
    redisClient.get('customer', function(err, reply) {
      res.render('home');
    });
  });
});

app.get('/pg-sleep', function(req, res) {
	pg.connect(connString, function(err, pgClient, done) {
		pgClient.query('SELECT pg_sleep(1)', [], function(err, result) {
      done();
      res.render('home');
		});
	});
});

app.get('/all', function(req, res) {
	var redisClient = redis.createClient();
  req.miniprofiler.step('Waiting 1 second', function() {

    pg.connect(connString, function(err, pgClient, done) {
      pgClient.query('SELECT pg_sleep(1)', [ ], function(err, result) {

        req.miniprofiler.step('Get from cache', function() {

          redisClient.set('customer', 'john@domain.com', function() {
            redisClient.get('key', function(err, reply) {
              res.render('home');
            });
          });

        });

      });
    });

  });
});

app.listen(8080);