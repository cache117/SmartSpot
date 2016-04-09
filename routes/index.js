var express = require('express');
var router = express.Router();
var SmartSpot = require('../SmartSpot');

var clientId = 'de9c4a4a601a43a093584aefeef9b845';
var clientSecret = '3039cd179c4d4673b04aa3cfda9c9bf1';
var redirectUri = 'http://localhost:3001/callback';

var smartSpot = new SmartSpot(clientId, clientSecret, redirectUri);

router.get('/login', function(req, res, next)
{
    smartSpot.login(req, res, next);
});

router.get('/create', function(req, res, next)
{
    //does the actual playlist creation.
});

router.get('/search', function(req, res, next)
{
    //smartSpot.getArtistID(req.) // TODO get the artists name from the request.
    res.render('index', { title:'Express' });
});

router.get('/callback', function(req, res, next)
{
    res.render('index', { title:'Express' });
});

module.exports = router;
