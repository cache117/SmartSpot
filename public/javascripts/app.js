angular.module('smart-spot', [])
    .controller('MainCtrl', [
        '$scope', '$http',
        function($scope, $http)
        {
            $scope.createPlaylist = function()
            {
                var artist = $scope.artist;
                console.log(artist);
                window.open("/login", "Playlist Creation", 'WIDTH=400, HEIGHT=500');
                return $http.get('/search?=' + $scope.artist)
                    .success(function(data)
                    {
                        console.log(data);
                    });

            }
        }
    ]);
