var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

var clientId = 'de9c4a4a601a43a093584aefeef9b845';
var clientSecret = '3039cd179c4d4673b04aa3cfda9c9bf1';
var redirectUri = 'ec2-54-174-133-70.compute-1.amazonaws.com:3001/callback';

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/login', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;
