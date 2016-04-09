angular.module('smart-spot', [])
    .controller('MainCtrl', [
        '$scope', '$http',
        function($scope, $http)
        {
            $scope.createPlaylist = function()
            {
                console.log("In createPlaylist()"); //TODO not working properly.
            }
        }
    ]);