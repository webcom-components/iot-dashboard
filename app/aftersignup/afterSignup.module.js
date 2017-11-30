'use strict';

/** Define the after sign up module with public access **/
var myAfterSignup = angular.module('myApp.aftersignup', ['ngRoute']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/aftersignup', {
            templateUrl: 'aftersignup/aftersignup.html',
            controller: 'AfterSignupController',
            controllerAs: 'afterSignupController',
            publicAccess: true
        });
    }
])

/** Export the after signup module **/
export default myAfterSignup;
