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

    this.demo = function(req, res, next)
    {
        // Get an artist's top tracks
        spotifyApi.getArtistTopTracks('0oSGxfWSnnOXhD2fKuz2Gy', 'GB')
            .then(function(data)
            {
                console.log(data.body);
            }, function(err)
            {
                console.log('Something went wrong!', err);
            });

        spotifyApi.getArtistTopTracks('0oSGxfWSnnOXhD2fKuz2Gy', 'GB')
            .then(function(data)
            {
                console.log(data.body);
            }, function(err)
            {
                console.log('Something went wrong!', err);
            });
    };

    this.login = function(req, res, callback)
    {
        var state = generateRandomString(16);
        var scopes = ['playlist-modify-private', 'playlist-modify-public', 'playlist-read-private'];
        var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

        console.log(authorizeURL);
        res.redirect(authorizeURL);
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
                console.log('Search artists for ' + name, data.body);
                var closestArtist = data.body.artists.items[0];
                console.log(closestArtist);
                console.log('Closest artist: ' + closestArtist.name + ' with ID: ' + closestArtist.id);
                callback(closestArtist);
            }, function(err)
            {
                console.error(err);
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
                    console.log('I got ' + data.body.artists.length + ' similar artists!');
                    callback(data.body);
                }
                else
                {
                    console.log('No related artists found');
                }

            }, function(err)
            {
                console.log('Something went wrong..', err.message);
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
                console.log(data.body);
                callback(data.body);
            }, function(err)
            {
                console.log('Something went wrong!', err);
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
                console.log('Created playlist!', data);
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
}

module.exports = SmartSpot;