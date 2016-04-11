var express = require('express');
var router = express.Router();
var SmartSpot = require('../SmartSpot');

var clientId = 'de9c4a4a601a43a093584aefeef9b845';
var clientSecret = '3039cd179c4d4673b04aa3cfda9c9bf1';
var redirectUri = 'http://localhost:3001/callback';

var smartSpot = new SmartSpot(clientId, clientSecret, redirectUri);

router.use(express.static(__dirname + '/public'));

router.get('/login', function(req, res, next)
{
    smartSpot.login(req, res, next)
        .then(function(data)
        {
            // "Retrieved data for Faruk Sahin"
            console.log('Retrieved data for ' + data.body['display_name']);

            // "Email is farukemresahin@gmail.com"
            console.log('Email is ' + data.body.email);

            // "Image URL is http://media.giphy.com/media/Aab07O5PYOmQ/giphy.gif"
            console.log('Image URL is ' + data.body.images[0].url);

            // "This user has a premium account"
            console.log('This user has a ' + data.body.product + ' account');
        });
});

router.get('/create', function(req, res, next)
{
    //does the actual playlist creation.
});

router.get('/search', function(req, res, next)
{
    var artist = req.param('artist');
    console.log("Artist: " + artist);
    smartSpot.getArtistID(artist, function(data)
    {
        console.log("Data: " + data);
        res.json(data.id);
    });
});

router.get('/callback', function(req, res, next)
{
    //redirect to search
    var artist = req.param('artist');
    console.log("Artist: " + artist);
    smartSpot.getArtistID(artist, function(data)
    {
        console.log("Data: " + data);
        res.json(data.id);
    });
    //use that id to find related artists
    //get top tracks of those artist.
    //save those artists
    res.sendfile('public/playlistCreation.html');
});

router.get('/me', function(req, res, next)
{
    var userName = smartSpot.getUserName();
    console.log(userName);
});

router.get('/demo', function(req, res, next)
{
    smartSpot.demo(req, res, next);
    res.sendfile('public/playlistCreation.html');
});

module.exports = router;
