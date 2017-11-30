'use strict';

/** Define the login module with public access **/
var myLogin = angular.module('myApp.login', ['ngRoute']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/login', {
            templateUrl: 'login/login.html',
            controller: 'LoginController',
            controllerAs: 'LoginController',
            publicAccess : true
        });
    }
]);

/** Export the login module **/
export default myLogin;
