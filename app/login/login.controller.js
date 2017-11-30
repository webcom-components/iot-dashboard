'use strict';

/** Import the login module from the file **/
import myLogin from './login.module.js';

/** The controller of login page **/
myLogin.controller('LoginController', [
  '$rootScope',
  'authentication',
  function($rootScope, authentication) {

    var self = this;

    self.loginError = null;

    /** The login function **/
    self.login = function(email, password) {

      authentication.login(email, password).then(function() {
        console.log("connection success promise");
      }).catch(function(errorCode) {
        self.loginError = errorCode;
        self.password = "";
        if (!$rootScope.$$phase)
          $rootScope.$apply();
      });

    };
  }
]);
