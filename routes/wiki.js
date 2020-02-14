// wiki.js - Wiki route Module

var express = require('express');
var router = express.Router();

// Home
router.get('/', function (req, res) {
  res.send('Wiki home page');
})

//About
router.get('/about', function (req, res) {
  res.send('About this wiki')
})

module.exports = router
