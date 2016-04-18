/**
 * Taps into the Spotify API to create a playlist with top songs from artists most like a certain artist.
 * @param {string} clientId the client ID code given to the user by Spotify.
 * @param {string} clientSecret the client secret code given to the user by Spotify.
 * @param {string} redirectUri a Redirect URI that has been white-listed by Spotify.
 * @constructor creates a SmartSpot that can access the Spotify API.
 */
function SmartSpot(clientId, clientSecret, redirectUri)
{
    var SpotifyWebApi = require('spotify-web-api-node');
    var querystring = require("querystring");
    var cookieParser = require('cookie-parser');
    var request = require('request');
    var stateKey = 'spotify_auth_state';

    var spotifyApi = new SpotifyWebApi({
        clientId:clientId,
        clientSecret:clientSecret,
        redirectUri:redirectUri
    });

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

    this.login = function(req, res)
    {
        var state = generateRandomString(16);
        res.cookie(stateKey, state);

        var scopes = ['playlist-modify-private', 'playlist-modify-public', 'playlist-read-private'];
        var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

        //console.log(authorizeURL);
        res.redirect(authorizeURL);
    };

    this.callback = function(req, res)
    {
        var code = req.query.code || null;
        var state = req.query.state || null;
        var storedState = req.cookies ? req.cookies[stateKey] : null;

        if (state === null || state !== storedState)
        {
            res.redirect('/#' +
                querystring.stringify({
                    error:'state_mismatch'
                }));
        }
        else
        {
            res.clearCookie(stateKey);
            spotifyApi.authorizationCodeGrant(code)
                .then(function(data)
                {
                    spotifyApi.setAccessToken(data.body['access_token']);
                    spotifyApi.setRefreshToken(data.body['refresh_token']);
                    res.redirect('/callback.html#' +
                        querystring.stringify({
                            access_token:spotifyApi.getAccessToken(),
                            refresh_token:spotifyApi.getRefreshToken()
                        }));
                }, function(err)
                {
                    console.error(err);
                    res.redirect('/#' +
                        querystring.stringify({
                            error:'invalid_token'
                        }));
                });
        }
    };

    this.getRefreshToken = function(req, res)
    {
        spotifyApi.refreshAccessToken()
            .then(function(data)
            {
                res.send({
                    'access_token':spotifyApi.getAccessToken()
                });
            }, function(err)
            {
                console.log(err);
            });
    };

    /**
     * Gets the artist ID that most closely matches the given artist name.
     * @param {string} name the name of the artist to search for.
     * @param {function} callback the callback to send the Json response to.
     */
    this.getArtistID = function(name, callback)
    {
        spotifyApi.searchArtists(name)
            .then(function(data)
            {
                //console.log('Search artists for ' + name, data.body);
                var closestArtist = data.body.artists.items[0];
                //console.log(closestArtist);
                //console.log('Closest artist: ' + closestArtist.name + ' with ID: ' + closestArtist.id);
                callback(closestArtist);
            }, function(err)
            {
                console.error(err);
                callback(err);
            });
    };

    /**
     * Gets the artists related to the given artist.
     * @param {string} artistId the Spotify ID of the artist.
     * @param {function} callback the callback to send the Json response to.
     * @returns {Object} the most similar artist.
     */
    this.getRelatedArtists = function(artistId, callback)
    {
        spotifyApi.getArtistRelatedArtists(artistId)
            .then(function(data)
            {
                if (data.body.artists.length)
                {
                    // Print the number of similar artists
                    //console.log('I got ' + data.body.artists.length + ' similar artists!');
                    callback(data.body);
                }
                else
                {
                    console.log('No related artists found');
                    callback("No related artists found");
                }
            }, function(err)
            {
                console.log('Something went wrong..', err.message);
                callback(err);
            });
    };

    /**
     * Gets the top tracks from the given artist.
     * @param {string} artistId the id of the artist.
     * @param {function} callback the callback to send the Json response to.
     */
    this.getArtistTopTracks = function(artistId, callback)
    {
        spotifyApi.getArtistTopTracks(artistId, 'US')
            .then(function(data)
            {
                //console.log(data.body);
                callback(data.body);
            }, function(err)
            {
                console.log('Something went wrong!', err);
                callback(err);
            });
    };

    /**
     * Creates a playlist for the given user with the given title and songs.
     * @param {string} user the username of the person creating the playlist.
     * @param {string} playlistTitle the title of the playlist.
     * @param {Array.<string>} tracks the tracks in the playlist. This should be an array of the form <code>["spotify:track:id", "spotify:track:id", ...]</code>.
     */
    this.buildPlaylist = function(user, playlistTitle, tracks)
    {
        // Create a private playlist
        spotifyApi.buildPlaylist(user, playlistTitle, { 'public':true })
            .then(function(data)
            {
                //console.log('Created playlist!', data);
                var playlistId = data.id; //TODO probably wrong.
                // Add tracks to a playlist
                spotifyApi.addTracksToPlaylist(user, playlistId, tracks)
                    .then(function(data)
                    {
                        console.log('Added tracks to playlist!');
                    }, function(err)
                    {
                        console.log('Something went wrong!', err);
                    });
            }, function(err)
            {
                console.log('Something went wrong!', err);
            });
    };

    this.getMe = function(authCode, callback)
    {
        if (authCode)
        {
            spotifyApi.authorizationCodeGrant(authCode)
                .then(function(response)
                {
                    var accessToken = response.body['access_token'];
                    console.log("Got Access Token: " + accessToken);
                    spotifyApi.setAccessToken(accessToken);
                    return spotifyApi.getMe();
                })
                .then(function(data)
                {
                    console.log("Me: " + data);
                    callback(data.body);
                });
        }
        else
        {
            spotifyApi.getMe()
                .then(function(data)
                {
                    callback(data);
                }, function(err)
                {
                    callback(err);
                });
        }
    };

    this.getAccessToken = function(callback)
    {
        callback(spotifyApi.getAccessToken());
    };

    this.refreshAccessToken = function(callback)
    {
        callback(spotifyApi.refreshAccessToken());
    };
}

module.exports = SmartSpot;