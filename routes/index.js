var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

var clientId = 'de9c4a4a601a43a093584aefeef9b845';
var clientSecret = '3039cd179c4d4673b04aa3cfda9c9bf1';
var redirectUri = 'http://localhost:3001/callback';

// credentials are optional
var spotifyApi = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret,
    redirectUri: redirectUri
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function (length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (var i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

router.get('/login', function (req, res, next) {
    var state = generateRandomString(16);
    var scopes = ['playlist-modify-private', 'playlist-modify-public', 'playlist-read-private'];
    var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

    console.log(authorizeURL);
    res.redirect(authorizeURL);
});

router.get('/getArtist', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

router.get('/callback', function (req, res, next) {
    res.render('index', {title: 'Express'});
});

module.exports = router;
