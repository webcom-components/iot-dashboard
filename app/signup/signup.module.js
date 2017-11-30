'use strict';

/** Define the signup module with public access **/
var mySignup = angular.module('myApp.signup', ['ngRoute']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/signup', {
            templateUrl: 'signup/signup.html',
            controller: 'SignupController',
            controllerAs: 'SignupController',
            publicAccess: true
        });
    }
]);

/** Export the login module **/
export default mySignup;
