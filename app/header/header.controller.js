'use strict';

/** Import the header module from the file **/
import myHeader from './header.module.js';

/** The controller of header **/
myHeader.controller('HeaderController', [
  'authentication',
  '$scope',
  'userData',
  '$routeParams',
  function(authentication, $scope, userData, $routeParams) {

    var self = this;

    self.showConfigIcon = false;
    self.spaceId = $routeParams.spaceId;

    if (self.spaceId != undefined) {
      self.showConfigIcon = true;
    } else {
      self.showConfigIcon = false;
    }
    /** Inject the authentication service in the scope in order to watch it  **/
    $scope.authService = authentication;

    // Inject the userdata service in the scope in order to watch it
    $scope.service = userData;

    userData.userDataInit();

    // Run the user webcom subscription
    userData.userDataRef.on("value", userData.userSubscription);

    $scope.$watch('service.userSpaceInfos', function(newUserSpaceInfosVal) {

      self.userSpaceInfos = newUserSpaceInfosVal;

      console.log("HeaderController.userSpaceInfos Header ", self.userSpaceInfos);

    }, true);

    /** disconnect function **/
    self.logout = function() {

      authentication.disconnect();

    };

    /** Space navigation **/
    self.spaceEdition = function(spaceId) {
      //$event.preventDefault();
      userData.navSpaceEdition(spaceId);

    }

    /** Destroy the controller **/
    $scope.$on("$destroy", function() {

      // Unsubscription from all user spaces
      userData.userSpaceUnsubscription();

      // Unsubscription from the user data
      userData.userDataRef.off("value", userData.userSubscription);

      console.log("good bye Header");
    });

  }
]);
