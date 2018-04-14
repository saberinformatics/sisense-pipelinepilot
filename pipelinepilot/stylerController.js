
mod.controller('stylerController', ['$scope',
    function ($scope) {

        /**
         * variables
         */


        /**
         * watches
         */
        $scope.$watch('widget', function (val) {

            $scope.model = $$get($scope, 'widget.style');
        });



        /**
         * public methods
         */

        $scope.onChange = function($event){
            _.defer(function () { $scope.$root.widget.redraw(); });
        };

    }
]);