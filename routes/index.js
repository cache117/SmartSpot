var express = require('express');
var router = express.Router();
var SmartSpot = require('../SmartSpot');

var clientId = 'de9c4a4a601a43a093584aefeef9b845';
var clientSecret = '3039cd179c4d4673b04aa3cfda9c9bf1';
var redirectUri = 'http://localhost:3001/callback';

var smartSpot = new SmartSpot(clientId, clientSecret, redirectUri);

var authCode;

router.use(express.static(__dirname + '/public'));

router.get('/login', function(req, res, next)
{
    smartSpot.login(req, res);
});

router.post('/create', function(req, res, next)
{
    smartSpot.getMe(function(data)
    {
        var userName = data;
    });
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

router.get('/callback', function(req, res, next)
{
    authCode = req.param('code');
    console.log("Authorization Code: " + authCode);
    smartSpot.getMe(authCode, function(user)
    {
        console.log("UserName: " + user.id);
        res.sendfile('public/playlistCreation.html');
    });
});

router.get('/me', function(req, res, next)
{
    /*if (authCode !== null && authCode !== undefined)
    {*/
        smartSpot.getMe(authCode, function(user)
        {
            console.log("UserName: " + user.id);
            res.json(user);
        });
    /*}
    else
    {
        res.send("Must login first");
    }*/
});

router.get('/demo', function(req, res, next)
{
    smartSpot.demo(req, res, next);
    res.sendfile('public/playlistCreation.html');
});

module.exports = router;
