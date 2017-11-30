'use strict';

/** Define the space edition module with private access **/
var mySpaceEdition = angular.module('myApp.spaceedition', ['ngRoute','ngDialog']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/:spaceId/spaceedition', {
            templateUrl: 'spaceedition/spaceedition.html',
            controller: 'spaceEditionController',
            controllerAs: 'spaceEditionController',
            publicAccess: false
        });
    }
]);

/** Export the space edition module **/
export default mySpaceEdition;
