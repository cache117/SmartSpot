var spotifyAccessToken = '';
var playlistTracks = [];
var playlistName = '';

function getUsername(callback)
{
    //console.log('getUsername');
    var url = 'https://api.spotify.com/v1/me';
    $.ajax(url, {
        dataType:'json',
        headers:{
            'Authorization':'Bearer ' + spotifyAccessToken
        },
        success:function(r)
        {
            //console.log('got username response', r);
            callback(r.id);
        },
        error:function(r)
        {
            callback(null);
        }
    });
}

function createPlaylist(username, name, callback)
{
    //console.log('createPlaylist', username, name);
    var url = 'https://api.spotify.com/v1/users/' + username +
        '/playlists';
    $.ajax(url, {
        method:'POST',
        data:JSON.stringify({
            'name':name,
            'public':false
        }),
        dataType:'json',
        headers:{
            'Authorization':'Bearer ' + spotifyAccessToken,
            'Content-Type':'application/json'
        },
        success:function(r)
        {
            //console.log('create playlist response', r);
            callback(r.id);
        },
        error:function(r)
        {
            callback(null);
        }
    });
}

function addTracksToPlaylist(username, playlist, tracks, callback)
{
    //console.log('addTracksToPlaylist', username, playlist, tracks);
    var url = 'https://api.spotify.com/v1/users/' + username +
        '/playlists/' + playlist +
        '/tracks'; // ?uris='+encodeURIComponent(tracks.join(','));
    $.ajax(url, {
        method:'POST',
        data:JSON.stringify(tracks),
        dataType:'text',
        headers:{
            'Authorization':'Bearer ' + spotifyAccessToken,
            'Content-Type':'application/json'
        },
        success:function(r)
        {
            //console.log('add track response', r);
            callback(r.id);
        },
        error:function(r)
        {
            callback(null);
        }
    });
}

function compilePlaylist()
{
    //parse hash
    var hash = location.hash.replace(/#/g, '');
    var all = hash.split('&');
    var args = {};
    //console.log('all', all);
    all.forEach(function(keyvalue)
    {
        var idx = keyvalue.indexOf('=');
        var key = keyvalue.substring(0, idx);
        var val = keyvalue.substring(idx + 1);
        args[key] = val;
    });

    playlistName = localStorage.getItem('SmartSpot-name');
    playlistTracks = JSON.parse(localStorage.getItem('SmartSpot-tracks'));
    //console.log(playlistName);

    //console.log('got args', args);
    if (typeof(args['access_token']) != 'undefined')
    {
        //console.log('got access token', args['access_token']);
        spotifyAccessToken = args['access_token'];
    }
    else
    {
        spotifyAccessToken = localStorage.getItem('SmartSpot-code');
        //console.log("Auth token: " + spotifyAccessToken);
    }

    getUsername(function(username)
    {
        //console.log('got username', username);
        createPlaylist(username, playlistName, function(playlist)
        {
            //console.log('created playlist', playlist);
            addTracksToPlaylist(username, playlist, playlistTracks, function()
            {
                //console.log('tracks added.');
                $('#playlist-app-link').attr('href', 'spotify:user:' + username + ':playlist:' + playlist);
                $('#playlist-web-link').attr('href', 'https://play.spotify.com/user/' + username + '/playlist/' + playlist);
                $('#creating').hide();
                $('#done').show();
            });
        });
    });
}
