'use strict';

/** Define the signup module with public access **/
var myResetPwd = angular.module('myApp.resetpwd', ['ngRoute']).config([
    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/resetpwd', {
            templateUrl: 'resetpwd/resetpwd.html',
            controller: 'ResetPwdController',
            controllerAs: 'ResetPwdController',
            publicAccess: true
        });
    }
]);

/** Export the login module **/
export default myResetPwd;
