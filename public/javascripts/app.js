require('../../smartspot.js');
angular.module('smart-spot', [])
    .controller('MainCtrl', [
        '$scope',
        function($scope)
        {
            $scope.createPlaylist = function()
            {
                console.log("working"); //TODO not working properly.
            }
        }
    ]);

var searchForArtist = function(artistName)
{

};