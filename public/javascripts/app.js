var app = angular.module('smart-spot', []);
app.controller('MainCtrl', [
    '$scope', '$http',
    function($scope, $http)
    {
        $scope.buildPlaylist = function()
        {
            var artistName = $scope.artist;
            if (artistName === undefined)
                return;
            //console.log(artistName);
            getArtistId(artistName)
                .then(function(response)
                {
                    var artistId = removeQuotes(response.data);
                    /*if (artistId === undefined)
                    {
                        window.open("/error", "Playlist Creation Error", 'WIDTH=400, HEIGHT=500');
                        return;
                    }*/
                    //console.log(artistId);
                    getRelatedArtists(artistId)
                        .then(function(response)
                        {
                            var relatedArtists = response.data.artists;
                            /*if (relatedArtists === undefined)
                            {
                                window.open("/error", "Playlist Creation Error", 'WIDTH=400, HEIGHT=500');
                                return;
                            }*/
                            //console.log(response);
                            var numberOfArtists = clipLength(relatedArtists.length, 19);
                            var tracks = [];
                            getTopTracks(artistId)
                                .then(function(response)
                                {
                                    /*if (response.data.tracks === undefined)
                                    {
                                        window.open("/error", "Playlist Creation Error", 'WIDTH=400, HEIGHT=500');
                                        return;
                                    }*/
                                    var numberOfTracks = clipLength(response.data.tracks.length, 5);
                                    for (var j = 0; j < numberOfTracks; j++)
                                    {
                                        tracks.push(response.data.tracks[j].uri);
                                    }
                                    for (var i = 0; i < numberOfArtists; i++)
                                    {
                                        getTopTracks(relatedArtists[i].id)
                                            .then(function(response)
                                            {
                                                var numberOfTracks = clipLength(response.data.tracks.length, 5);
                                                //console.log(response.data.tracks);
                                                for (var k = 0; k < numberOfTracks; k++)
                                                {
                                                    tracks.push(response.data.tracks[k].uri);
                                                }
                                                //console.log("Tracks: " + tracks);
                                                storePlaylistInLocalMemory(artistName, tracks);
                                                window.open("/login", "Playlist Creation", 'WIDTH=400, HEIGHT=500');
                                            }, function(error)
                                            {
                                                return $q.reject(error);
                                            });
                                    }
                                }, function(error)
                                {
                                    return $q.reject(error);
                                });
                        }, function(error)
                        {
                            return $q.reject(error);
                        });
                }, function(error)
                {
                    return $q.reject(error);
                });
        };

        var getArtistId = function(artist)
        {
            return $http.get('/search',
                {
                    params:{
                        artistName:artist
                    }
                }
            );
        };

        var getRelatedArtists = function(artistId)
        {
            return $http.get('/related',
                {
                    params:{
                        artistId:artistId
                    }
                }
            );
        };

        var getTopTracks = function(artistId)
        {
            return $http.get('/topTracks',
                {
                    params:{
                        artistId:artistId
                    }
                }
            );
        };

        var removeQuotes = function(value)
        {
            return value.replace(/['"]+/g, '');
        };

        var clipLength = function(actualLength, defaultLength)
        {
            if (actualLength < defaultLength)
                return actualLength;
            else
                return defaultLength;
        };

        var storePlaylistInLocalMemory = function(artistName, tracks)
        {
            localStorage.setItem("SmartSpot-tracks", JSON.stringify(tracks));
            localStorage.setItem("SmartSpot-name", artistName + " Mashup");
        };
    }
]);

app.controller('CreationCtrl', [
    '$scope', '$http',
    function($scope, $http)
    {
        $scope.createPlaylist = function()
        {
            var playlistName = localstorage.getItem("SmartSpot-name");
            var tracks = JSON.parse(localstorage.getItem("SmartSpot-tracks"));
            console.log(tracks);
            getMe()
                .then(function(response)
                {
                    console.log('tracks added.');
                    username = response.id;
                    playlist = '0SGVg26tbs6M2hSBc3ghIK';
                    $('#playlist-link').attr('href', 'spotify:user:' + username + ':playlist:' + playlist);
                    $('#creating').hide();
                    $('#done').show();
                }, function(error)
                {
                    console.log("Error: " + error);
                });
        };
        $scope.createPlaylist();

        var getMe = function()
        {
            return $http.get('/me');
        };
    }
]);
