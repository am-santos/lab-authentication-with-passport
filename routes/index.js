'use strict';

const { Router } = require('express');
const router = Router();

const routeGuard = require('../middleware/route-guard');

router.get('/', (req, res, next) => {
  console.log(res.locals.user);
  res.render('index', { title: 'Hello World!' });
});

router.get('/private', routeGuard, (req, res, next) => {
  // console.log(user);
  res.render('private');
});

module.exports = router;
