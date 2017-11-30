'use strict';

var mySensors = angular.module('myApp.sensors', ['ngRoute']).config([

    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/:spaceId/sensors', {
            templateUrl: 'sensors/sensors.html',
            controller: 'SensorsController',
            controllerAs: 'sensorsController',
            publicAccess: false
        });
    }
]);

export default mySensors;
