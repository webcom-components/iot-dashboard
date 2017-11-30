'use strict';

/** Importation **/
import 'webcom/webcom.js'; // webcom module


/** Create authentication module **/
var authenticationModule = angular.module('authenticationModule', ['myConfigModule']);

/** Define authentication service **/
authenticationModule.service('authentication', [
  '$location',
  '$rootScope',
  'myConfigService',

  function($location, $rootScope, myConfigService) {

    var self = {};
    var apiUrl = undefined;
    var authUser = null;
    var userId = null;

    self.serviceInit = function() {

      apiUrl = myConfigService.datasyncUri;

      // Create a connection to the back-end
      self.ref = new Webcom(apiUrl);

      // Register the authentication callback
      self.ref.resume(checkAuth);
    }

    self.userIdForTest = function(userIdTest) {
      userId = userIdTest;
    }

    self.serviceInit();

    /** Login function **/
    self.login = function(email, password) {

      var credentials = {
        email: email,
        password: password
      };

      return new Promise(function(resolve, reject) {
        self.ref.authWithPassword(credentials).then(function(success) {
          resolve(success);
        }).catch(function(error) {
          console.log(error);
          console.log("error.code in login fn (auth-service)" + error.code);
          reject(error.code);
          //refreshDatas();
        });
        console.log('try to log in with ', credentials);
      });
    }

    /** Disconnect function **/
    self.disconnect = function() {

      return new Promise(function(resolve, reject) {
        self.ref.logout(function(error) {
          if (error) {
            reject(error.code);
            refreshDatas();
            console.log("an error occurred in disconnect fn (auth-service)", error.code);
          } else {
            authUser = null;
            localStorage.removeItem("selectedSpaceID");

            $location.path('/login');
            resolve(authUser);
            refreshDatas();
            console.log("Disconnection performed");
          }
        });
        refreshDatas();//XXX useless / remove ?
      });

    }

    /** Check authentication function **/
    function checkAuth(error, auth) {

      // console.log("checkAuth");
      if (error == null) {

        authUser = auth;
        if (auth == null) {

          // console.log("Not connected");

        } else {

          console.log("Authenticated: " + auth.providerUid);
          var requestedLocation = localStorage.getItem("requestedLocation");
          console.log("requestedLocation", requestedLocation);
          $location.path(requestedLocation);
          refreshDatas();

        }
      } else {

        console.log("Error auth: " + error);

      }

    }

    /** Get the user authentication state function **/
    self.getAuth = function() {
      return authUser;
    }

    /** Get the user UID function **/
    self.getMyUid = function() {

      if (!authUser) {
        return userId;
      } else {
        return authUser.uid;
      }
    }

    /** Get the user email function **/
    self.getMyEmail = function() {

      if (!authUser) {
        return null;
      } else {
        return authUser.providerUid;
      }
    }

    /** Refresh application function **/
    function refreshDatas() {
      if (!$rootScope.$$phase)
        $rootScope.$apply();
    }

    return self;

  }
]);
