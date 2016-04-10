angular.module('smart-spot', [])
    .controller('MainCtrl', [
        '$scope', '$http',
        function($scope, $http)
        {
            $scope.createPlaylist = function()
            {
                window.open("/login", "Playlist Creation", 'WIDTH=400,HEIGHT=500');
                //var artist = $scope.artist;
                //console.log($scope.artist);
                $http.post("/create", artist).success(function(data)
                {
                    console.log("Worked. " + data);
                });

            }
        }
    ]);
