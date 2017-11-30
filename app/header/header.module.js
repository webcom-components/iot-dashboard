'use strict';

/** Define the header module **/
var myHeader = angular.module('myApp.header', ['ngRoute']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/header', {});
    }
])
/** Define the header directive **/
.directive('myHeader', function() {
    return {

        controller: 'HeaderController',
        controllerAs: 'HeaderController',
        templateUrl: 'header/header.html'
    };
});

/** Export the header module **/
export default myHeader;
