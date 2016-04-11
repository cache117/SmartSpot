var app = angular.module('smart-spot', []);
app.controller('MainCtrl', [
    '$scope', '$http',
    function($scope, $http)
    {
        $scope.buildPlaylist = function()
        {
            var artistName = $scope.artist;
            console.log(artistName);
            window.open("/login", "Playlist Creation", 'WIDTH=400, HEIGHT=500');
            getArtistId(artistName)
                .then(function(response)
                {
                    var artistId = removeQuotes(response.data);
                    console.log(artistId);
                    getRelatedArtists(artistId)
                        .then(function(response)
                        {
                            var relatedArtists = response.data.artists;
                            console.log(response);
                            var size = 19;
                            if (relatedArtists.length < size)
                                size = relatedArtists.length;
                            var tracks = [];
                            getTopTracks(artistId)
                                .then(function(response)
                                {
                                    for (var j = 0; j < 5; j++)
                                    {
                                        tracks.push(response.data.tracks[j].uri);
                                    }
                                    for (var i = 0; i < size; i++)
                                    {
                                        getTopTracks(relatedArtists[i].id)
                                            .then(function(response)
                                            {
                                                console.log(response.data.tracks);
                                                for (var k = 0; k < 5; k++)
                                                {
                                                    tracks.push(response.data.tracks[k].uri);
                                                }
                                                console.log("Tracks: " + tracks);
                                                localStorage.setItem("SmartSpot-tracks", JSON.stringify(tracks));
                                                localStorage.setItem("SmartSpot-name", artistName + " Mashup");
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
