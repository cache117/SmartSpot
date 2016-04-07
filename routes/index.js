var express = require('express');
var router = express.Router();
var SpotifyWebApi = require('spotify-web-api-node');

var clientId = '4ac16aa3e074460eadc89752bdf4c6c6';
var clientSecret = '65e0843ce1c6402095359b0e0ca5fa1f';
var redirectUri = 'http://ec2-54-174-133-70.compute-1.amazonaws.com:3001/callback';

// credentials are optional
var spotifyApi = new SpotifyWebApi({
  clientId : clientId,
  clientSecret : clientSecret,
  redirectUri : redirectUri
});

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
var generateRandomString = function(length) {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function(req, res, next) {
	var state = generateRandomString(16);
	  
	var scopes = ['user-read-private', 'user-read-email'],
		redirectUri = redirectUri,
		clientId = clientId,
		state = state;
		
	var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

	console.log(authorizeURL);
	res.redirect(authorizeURL);
});

router.get('/callback', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
