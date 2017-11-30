'use strict';

/** Import the user module from the file **/
import myUser from './user.module.js';

/** The controller of user page **/
myUser.controller('UserController', [
  '$rootScope',
  '$scope',
  '$timeout',
  '$window',
  '$location',
  'userData',
  'authentication',
  'ngDialog',

  function($rootScope, $scope, $timeout, $window, $location, userData, authentication, ngDialog) {

    var self = this;
    var alertCreateSpaceTimer = null,
      alertCreateSpaceErrorTimer = null;
    var alertleaveSpaceTimer = null;
    var errorCodeChangePassword = null;
    var email = null;
    var userId = null;
    var timeout = 10000;
    var alertPasswordChangedSuccessTimer = null,
      alertSuccessSaveTimer = null,
      alertErrorSaveTimer = null,
      alertPasswordChangedErrorTimer = null,
      alertuserInfosErrorTimer = null;
    var nameBeforeUpdate = null,
      surnameBeforeUpdate = null,
      langBeforeUpdate = null;

    self.alertPasswordChangedSuccess = false;
    self.alertSuccessSave = false;
    self.alertPasswordChangedError = false;
    self.email = email;
    self.userId = userId;
    self.name = "";
    self.surname = "";
    self.disableSaveData = true;
    self.disableReset = true;
    self.modify = "Modify";
    self.prop = {
      "type": "select",
      "name": "LangPref",
      "value": "Auto",
      "values": ["Auto", "FR", "EN"]
    };
    self.pushError = null;
    self.setError = null;
    self.createSpaceApplied = false;
    self.leaveSpaceApplied = false;

    /** Inject the user data service in the scope in order to watch it  **/
    $scope.userdataService = userData;

    /** Inject the authentication service in the scope in order to watch it  **/
    $scope.authService = authentication;

    userData.userDataInit();

    // Run the user webcom subscription
    userData.userDataRef.on("value", userData.userSubscription);

    $scope.$watch('userdataService.userSpaceInfos', function(newUserSpaceInfosVal, oldUserSpaceInfosVal) {

      console.log("newUserSpaceInfosVal", newUserSpaceInfosVal);

      if (oldUserSpaceInfosVal !== newUserSpaceInfosVal) {

        self.userSpaceInfos = newUserSpaceInfosVal;
        console.log("userSpaceInfos", self.userSpaceInfos);

      }
    }, true);

    $scope.$watch('userdataService.userSnapshot', function(newUserSnapshotVal, oldUserSnapshotVal) {

      email = authentication.getMyEmail();
      userId = authentication.getMyUid();
      self.userId = userId;
      self.email = email;

      if (oldUserSnapshotVal !== newUserSnapshotVal) {

        // If there is no snapshot: do nothing
        if (newUserSnapshotVal === null // If there are no information
        ) {} else if (newUserSnapshotVal.val() === null) {

          self.name = "";
          self.surname = "";
          self.disableSaveData = false;
          self.modify = "Save";

        } else {

          self.name = newUserSnapshotVal.val().name;
          self.surname = newUserSnapshotVal.val().surname;
          self.disableSaveData = true;
          self.modify = "Modify";
          var prefLang = newUserSnapshotVal.val().prefLang;
          angular.forEach(self.prop.values, function(value, key) {
            if (angular.equals(prefLang.toLowerCase(), value.toLowerCase())) {
              self.prop.value = value;
            }
          });

        }
        nameBeforeUpdate = self.name;
        surnameBeforeUpdate = self.surname;
        langBeforeUpdate = prefLang;
        refreshDatas();

      }
    });

    self.resetData = function() {

      self.name = nameBeforeUpdate;
      self.surname = surnameBeforeUpdate;
      angular.forEach(self.prop.values, function(value, key) {
        if (angular.equals(langBeforeUpdate.toLowerCase(), value.toLowerCase())) {
          self.prop.value = value;
        }
      });

    }

    /** Modify data function **/
    self.saveData = function(surname, name, preferredLanguage) {

      if (self.disableSaveData) {
        self.disableReset = false;
        self.disableSaveData = false;
        self.modify = "Save";

      } else if (!self.disableSaveData) {

        userData.setUserData(name, surname, email, preferredLanguage).then(function(success) {
          cancelAllAlerts();

          alertSuccessSaveTimer = $timeout(function() {
            self.alertSuccessSave = false;
          }, timeout);
          self.alertSuccessSave = true;
          self.disableSaveData = true;
          self.disableReset = true;
          self.modify = "Modify";
          refreshDatas();

        }).catch(function(error) {

          cancelAllAlerts();
          self.saveDataError = error.code;
          alertErrorSaveTimer = $timeout(function() {
            self.alertErrorSave = false;
          }, timeout);
          self.alertErrorSave = true;
          self.disableSaveData = false;
          self.modify = "Save";
          self.disableReset = false;
          refreshDatas();

        });

      }
      return self.disableSaveData;
    };

    /** space creation function **/
    self.createSpace = function(spaceName) {

      userData.createSpace(spaceName).then(function(success) {
        console.log("success add space ");
        cancelAllAlerts();

        self.createSpaceError = success;
        self.userInfosError = userData.userInfosError;
        self.spaceName = "";
        self.createSpaceApplied = !self.userInfosError;

        if (self.userInfosError) {

          alertuserInfosErrorTimer = $timeout(function() {
            self.userInfosError = false;
          }, 10000);
        } else {

          alertCreateSpaceTimer = $timeout(function() {
            self.createSpaceApplied = false;
            var currentSpaceId = localStorage.getItem("selectedSpaceID");
            $location.path('/' + currentSpaceId + '/spaceedition');
          }, 2000);
        }
        refreshDatas();

      }).catch(function(error) {

        console.log("error add space ");
        cancelAllAlerts();

        self.createSpaceError = error;
        self.userInfosError = userData.userInfosError;
        self.spaceName = "";
        self.createSpaceApplied = !self.userInfosError;
        self.createSpaceNotApplied = true;

        if (self.userInfosError) {
          self.createSpaceNotApplied = false;
          alertuserInfosErrorTimer = $timeout(function() {
            self.userInfosError = false;
          }, 10000);
        } else {
          alertCreateSpaceErrorTimer = $timeout(function() {
            self.createSpaceNotApplied = false;
          }, 10000);
        }
        refreshDatas();

      });

    }

    /** Space deletion function **/
    self.leaveSpace = function(spaceId) {
      return new Promise(function(resolve, reject) {
        userData.leaveSpace(spaceId).then(function(success) {
          cancelAllAlerts();
          self.leaveSpaceApplied = true;

          alertleaveSpaceTimer = $timeout(function() {
            self.leaveSpaceApplied = false;
          }, 10000);
          resolve();
          refreshDatas();

        }).catch(function(error) {
          cancelAllAlerts();
          self.leaveSpaceError = error.code;
          self.leaveSpaceNotApplied = true;

          alertleaveSpaceTimer = $timeout(function() {
            self.leaveSpaceNotApplied = false;
          }, 10000);
          reject(error);
          refreshDatas();

        });
      });
    }

    /** Space edition **/
    self.spaceEdition = function(spaceId) {
      userData.navSpaceEdition(spaceId);
      refreshDatas();

    }

    /** change password function **/
    self.changePassword = function(currentPassword, newPassword) {

      authentication.ref.changePassword(email, currentPassword, newPassword, function(error) {

        console.log("erreur change password function: ", self.passwordError);
        cancelAllAlerts();

        if (error === null) {

          cancelAllAlerts();

          alertPasswordChangedSuccessTimer = $timeout(function() {
            self.alertPasswordChangedSuccess = false;
          }, timeout);
          self.alertPasswordChangedSuccess = true;
          refreshDatas();

          console.log("Password changed successfully");

        } else {
          cancelAllAlerts();
          self.passwordError = error.code;
          self.alertPasswordChangedError = true;
          alertPasswordChangedErrorTimer = $timeout(function() {
            self.alertPasswordChangedError = false;
          }, timeout);
          refreshDatas();

          console.log("Error changing password:", error.code);
        }

      });

      self.currentPassword = "";
      self.newPassword = "";
      self.confirmNewPassword = "";
    }

    /** Request invitation function **/
    self.requestInvitation = function() {

      // Open the preferred email application and send a message with the UID
      $window.open("mailto:emailExample@example.com?subject= I have an UID invite me to your space!&body=Hello</br>Im " + self.name + " You can add invite to your space with this  UID :" + userId + "</br> Regards");
    }

    self.leaveSpaceConfirmation = function(spaceId) {
      $scope.popupToDo = "leaveSpace";
      $scope.spaceId = spaceId;
      $scope.leaveSpace = self.leaveSpace;
      self.openPopup();
    }

    self.openPopup = function() {
      ngDialog.open({controller: 'PopupController', templateUrl: 'popup/popupTmpl.html', showClose: false, scope: $scope});
    }

    function refreshDatas() {
      if (!$rootScope.$$phase)
        $rootScope.$apply();
      }
    function cancelAllAlerts() {

      self.createSpaceNotApplied = false;
      self.saveDataError = false;
      self.alertPasswordChangedError = false;
      self.alertPasswordChangedSuccess = false;
      self.alertSuccessSave = false;
      self.leaveSpaceError = false;
      self.createSpaceApplied = false;
      self.leaveSpaceApplied = false;
      self.leaveSpaceNotApplied = false;
      self.userInfosError = false;
      self.alertPasswordChangedError = false;
      self.passwordError = false;
      self.alertPasswordChangedSuccess = false;
      self.alertSuccessSave = false;

      $timeout.cancel(alertuserInfosErrorTimer);
      $timeout.cancel(alertCreateSpaceTimer);
      $timeout.cancel(alertleaveSpaceTimer);
      $timeout.cancel(alertSuccessSaveTimer);
      $timeout.cancel(alertPasswordChangedErrorTimer);
      $timeout.cancel(alertPasswordChangedSuccessTimer);
      $timeout.cancel(alertErrorSaveTimer);

    }

    $scope.$on("$destroy", function() {

      // Unsubscription from all user spaces
      userData.userSpaceUnsubscription();

      // Unsubscription from the user data
      userData.userDataRef.off("value", userData.userSubscription);

      self.name = "";
      self.surname = "";

      console.log("good bye user controller");
    });
  }
]);
