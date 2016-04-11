var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var SmartSpot = require('../SmartSpot');

var clientId = 'de9c4a4a601a43a093584aefeef9b845';
var clientSecret = '3039cd179c4d4673b04aa3cfda9c9bf1';
//var redirectUri = 'http://localhost:3001/callback.html';
var redirectUri = 'http://localhost:3001/callback';

var smartSpot = new SmartSpot(clientId, clientSecret, redirectUri);

var authCode;

router.use(express.static(__dirname + '/public'));

var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static(__dirname + '/public'))
    .use(cookieParser());

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length)
{
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++)
    {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

router.get('/login', function(req, res) {

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'playlist-modify-private playlist-modify-public playlist-read-private';
    res.redirect('https://accounts.spotify.com/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: clientId,
            scope: scope,
            redirect_uri: redirectUri,
            state: state
        }));
});

router.get('/callback', function(req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    var code = req.query.code || null;
    var state = req.query.state || null;
    var storedState = req.cookies ? req.cookies[stateKey] : null;

    if (state === null || state !== storedState) {
        res.redirect('/#' +
            querystring.stringify({
                error: 'state_mismatch'
            }));
    } else {
        res.clearCookie(stateKey);
        var authOptions = {
            url: 'https://accounts.spotify.com/api/token',
            form: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
            },
            headers: {
                'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
            },
            json: true
        };

        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {

                var access_token = body.access_token,
                    refresh_token = body.refresh_token;

                var options = {
                    url: 'https://api.spotify.com/v1/me',
                    headers: { 'Authorization': 'Bearer ' + access_token },
                    json: true
                };

                // use the access token to access the Spotify Web API
                request.get(options, function(error, response, body) {
                    console.log(body);
                });

                // we can also pass the token to the browser to make requests from there
                res.redirect('/callback.html#' +
                    querystring.stringify({
                        access_token: access_token,
                        refresh_token: refresh_token
                    }));
            } else {
                res.redirect('/callback.html#' +
                    querystring.stringify({
                        error: 'invalid_token'
                    }));
            }
        });
    }

    //res.sendfile('public/callback.html');
});

app.get('/refresh_token', function(req, res) {

    // requesting access token from refresh token
    var refresh_token = req.query.refresh_token;
    var authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            var access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
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
        console.log("refresh: " + data);
        res.json(data);
    });
});

router.get('/demo', function(req, res, next)
{
    smartSpot.demo(req, res, next);
    res.sendfile('public/playlistCreation.html');
});

module.exports = router;
