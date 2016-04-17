var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var SmartSpot = require('../SmartSpot');

var clientId = 'de9c4a4a601a43a093584aefeef9b845';
var clientSecret = '3039cd179c4d4673b04aa3cfda9c9bf1';
//var redirectUri = 'http://ec2-54-174-133-70.compute-1.amazonaws.com:3001/callback';
var redirectUri = 'http://localhost:3001/callback';

var smartSpot = new SmartSpot(clientId, clientSecret, redirectUri);

var authCode;

router.use(express.static(__dirname + '/public'))
    .use(cookieParser());

var stateKey = 'spotify_auth_state';

var app = express();

router.get('/login', function(req, res)
{
    smartSpot.login(req, res);
});

router.get('/callback', function(req, res)
{
    smartSpot.callback(req, res);
});

app.get('/refresh_token', function(req, res)
{
    smartSpot.getRefreshToken(req, res);
});

router.get('/search', function(req, res, next)
{
    var artist = req.param('artistName');
    console.log("Artist: " + artist);
    smartSpot.getArtistID(artist, function(data)
    {
        console.log("Data: " + data);
        res.json(data.id);
    });
});

router.get('/related', function(req, res, next)
{
    var artistId = req.param('artistId');
    console.log(artistId);
    smartSpot.getRelatedArtists(artistId, function(data)
    {
        console.log("Related Artists data: " + data);
        res.json(data);
    });
});

router.get('/topTracks', function(req, res, next)
{
    var artistId = req.param('artistId');
    console.log(artistId);
    smartSpot.getArtistTopTracks(artistId, function(data)
    {
        console.log("Top tracks: " + data);
        res.json(data);
    });
});

router.get('/me', function(req, res, next)
{
    authCode = req.param('code');
    smartSpot.getMe(authCode, function(user)
    {
        console.log("UserName: " + user.id);
        res.json(user);
    });
});

router.get('/refresh', function(req, res)
{
    smartSpot.refreshAccessToken(function(data)
    {
        //console.log("refresh: " + data);
        res.json(data);
    });
});

module.exports = router;
