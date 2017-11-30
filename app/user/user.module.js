'use strict';

/** Define the user module with private access **/
var myUser = angular.module('myApp.user', ['ngRoute','ngDialog']).config([

    '$routeProvider',
    function($routeProvider) {
        $routeProvider.when('/user', {
            templateUrl: 'user/user.html',
            controller: 'UserController',
            controllerAs: 'userController',
            publicAccess: false
        });
    }
]);

/** Export the user module **/
export default myUser;
