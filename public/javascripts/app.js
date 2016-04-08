angular.module('smart-spot', [])
    .controller('MainCtrl', [
        '$scope',
        function($scope)
        {
            $scope.createPlaylist = function()
            {
                console.log("In createPlaylist()"); //TODO not working properly.
            }
        }
    ]);