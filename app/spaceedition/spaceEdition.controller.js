'use strict';

/** Import the space edition module from the file **/
import mySpaceEdition from './spaceEdition.module.js';

/** The controller of space edition page **/
mySpaceEdition.controller('spaceEditionController', [
  '$scope',
  '$rootScope',
  'userData',
  'authentication',
  '$timeout',
  '$location',
  'ngDialog',
  function($scope, $rootScope, userData, authentication, $timeout, $location, ngDialog) {

    var self = this;
    var alertSuccessSaveTimer = null,
      alertErrorSaveTimer = null,
      alertSuccessAddCollaboratorTimer = null,
      alertErrorAddCollaboratorTimer = null,
      alertErrorDuplicateAddCollaboratorTimer = null,
      alertSuccessChangeCollaboratorRuleTimer = null,
      alertErrorChangeCollaboratorRuleTimer = null,
      alertSuccessRemoveCollaboratorTimer = null,
      alertErrorRemoveCollaboratorTimer = null;
    var timeout = 10000;
    var spaceNameBeforeUpdate = null,
      spaceDescriptionBeforeUpdate = null;

    self.spaceUpdateError = undefined;
    self.disableReset = true;
    self.disableSaveData = true;
    self.modify = "Modify";
    $scope.userdataService = userData;
    $scope.authService = authentication;
    self.alertSuccessSave = false;
    self.selectedSpaceID = null;
    self.ruleProp = {
      "type": "select",
      "name": "Rule",
      "value": "Member",
      "values": ["Member", "Administrator"]
    };

    /** Inject the user data service in the scope in order to watch it  **/
    $scope.userdataService = userData;

    /** Inject the authentication service in the scope in order to watch it  **/
    $scope.authService = authentication;

    userData.userDataInit();
    userData.userDataRef.on("value", userData.userSubscription);
    $scope.$watch('userdataService.userSpaceInfos', function(newUserSpaceInfosVal, oldUserSpaceInfosVal) {

      var notExist = true;
      userData.selectedSpaceID = localStorage.getItem("selectedSpaceID");

      // If the selected space Id has changed
      if (self.selectedSpaceID !== userData.selectedSpaceID) {
        self.alertSuccessSave = false;
        self.alertErrorSave = false;
        self.selectedSpaceID = userData.selectedSpaceID;
      }
      if (oldUserSpaceInfosVal !== newUserSpaceInfosVal) {

        self.disableSaveData = true;
        self.modify = "Modify";
        loopnewUserSpaceInfosVal: for (var i = 0; i < newUserSpaceInfosVal.length; i++) {
          var space = newUserSpaceInfosVal[i];
          // for (var space of newUserSpaceInfosVal) {
          if (space.id == userData.selectedSpaceID) {
            notExist = false;
            $scope.collaboratorsSpace = JSON.parse(JSON.stringify(space)).users;
            $scope.saveCollaboratorsSpaceInfosBeforePopup = JSON.parse(JSON.stringify(space)).users;
            if (space.users !== undefined) {
              // for (var user of space.users) {
              for (var j = 0; j < space.users.length; j++) {
                var user = space.users[j];
                if (user.role === "admin") {
                  $scope.collaboratorsSpace[j].role = "Administrator";
                  $scope.saveCollaboratorsSpaceInfosBeforePopup[j].role = "Administrator";
                } else {
                  $scope.collaboratorsSpace[j].role = "Member";
                  $scope.saveCollaboratorsSpaceInfosBeforePopup[j].role = "Member";
                }

                if (user.id === authentication.getMyUid()) {
                  if (user.role === "admin") {
                    self.isAdmin = true;
                    self.userId = user.id;
                    self.spaceName = space.spaceName;
                    refreshDatas();
                    if (!space.spaceDescription) {

                      self.disableSaveData = false;
                      self.modify = "Save";
                      self.spaceDescription = "";

                    } else {
                      self.spaceDescription = space.spaceDescription;
                    }
                  } else {
                    self.isAdmin = false;
                    self.spaceName = space.spaceName;
                    refreshDatas();
                    if (!space.spaceDescription) {

                      self.disableSaveData = true;
                      self.spaceDescription = "";

                    } else {
                      self.spaceDescription = space.spaceDescription;
                    }
                  }
                }
              }
            }
            spaceNameBeforeUpdate = self.spaceName;
            spaceDescriptionBeforeUpdate = self.spaceDescription;
            refreshDatas();
            break loopnewUserSpaceInfosVal;
          } else {
            notExist = true;
          }
        };
        if (notExist) {
          $location.path('user');
          refreshDatas();
        }
      }
    }, true);

    self.resetData = function() {
      self.spaceName = spaceNameBeforeUpdate;
      self.spaceDescription = spaceDescriptionBeforeUpdate;
    }
    /** update space function **/
    self.updateSpace = function(spaceName, spaceDescription) {
      return new Promise(function(resolve, reject) {
        if (self.disableSaveData) {
          self.disableSaveData = false;
          self.modify = "Save";
          self.disableReset = false;

          resolve();
          refreshDatas();
        } else if (!self.disableSaveData) {
          userData.updateSpace(spaceName, spaceDescription).then(function(success) {
            console.log("log success into ctrl", success);
            cancelAllAlerts();
            self.spaceUpdateError = success;
            alertSuccessSaveTimer = $timeout(function() {
              self.alertSuccessSave = false;
            }, timeout);
            self.disableSaveData = true;
            self.modify = "Modify";
            self.disableReset = true;
            self.alertSuccessSave = true;
            resolve();
            refreshDatas();

          }).catch(function(error) {

            console.log("log error into ctrl", error);
            cancelAllAlerts();
            self.spaceUpdateError = error.code;
            self.disableSaveData = false;
            self.modify = "Save";
            alertErrorSaveTimer = $timeout(function() {
              self.alertErrorSave = false;
            }, timeout);
            self.alertErrorSave = true;
            reject();
            refreshDatas();
          })
        };
      });
    }

    // much complete and test
    self.removeCollaborator = function(collaboratorId, spaceId, rule) {
      return new Promise(function(resolve, reject) {
        userData.removeCollaborator(collaboratorId, spaceId, rule).then(function() {
          cancelAllAlerts();
          self.removeCollaboratorError = null;
          alertErrorRemoveCollaboratorTimer = $timeout(function() {
            self.alertSuccessRemoveCollaborator = false;
          }, timeout);
          self.alertSuccessRemoveCollaborator = true;
          resolve();
          refreshDatas();
        }).catch(function(error) {
          cancelAllAlerts();
          self.removeCollaboratorError = error.code;
          alertErrorRemoveCollaboratorTimer = $timeout(function() {
            self.alertErrorRemoveCollaborator = false;
          }, timeout);
          self.alertErrorRemoveCollaborator = true;
          reject(error);
          refreshDatas();
        });
      });
    }

    /** Add collaborator function **/
    self.addCollaborator = function(collaboratorId, rule) {
      return new Promise(function(resolve, reject) {
        var newCollaborator = true;
        loop1: for (var i = 0; i < userData.userSpaceInfos.length; i++) {

          var space = userData.userSpaceInfos[i];
          // for (var space of userSpaceInfos) {
          if (space.id === userData.selectedSpaceID) {

            if (space.users !== undefined) {
              $scope.collaboratorsSpace = JSON.parse(JSON.stringify(space)).users;
              console.log("$scope.collaboratorsSpace : ", $scope.collaboratorsSpace);

              // for (var user of space.users) {
              loop2: for (var j = 0; j < space.users.length; j++) {
                var user = space.users[j];
                if (user.role === "admin") {
                  $scope.collaboratorsSpace[j].role = "Administrator";
                } else {
                  $scope.collaboratorsSpace[j].role = "Member";
                }

                if (user.id === collaboratorId) {
                  cancelAllAlerts();
                  newCollaborator = false;
                  self.addCollaboratorError = null;
                  alertErrorDuplicateAddCollaboratorTimer = $timeout(function() {
                    self.alertErrorDuplicateAddCollaborator = false;
                  }, timeout);
                  self.alertErrorDuplicateAddCollaborator = true;
                }
              }
            }
          }
          if (!newCollaborator) {
            console.log("NOT a new collaborator");
            reject()
            break loop1;
          }

          refreshDatas();
        }
        if (newCollaborator) {
          userData.addCollaborator(collaboratorId, rule).then(function(success) {
            cancelAllAlerts();
            self.addCollaboratorError = success;

            alertSuccessAddCollaboratorTimer = $timeout(function() {
              self.alertSuccessAddCollaborator = false;
            }, timeout);
            self.alertSuccessAddCollaborator = true;
            resolve();
            refreshDatas();
          }).catch(function(error) {
            cancelAllAlerts();
            self.addCollaboratorError = error.code;

            alertErrorAddCollaboratorTimer = $timeout(function() {
              self.alertErrorAddCollaborator = false;
            }, timeout);
            self.alertErrorAddCollaborator = true;
            reject();
            refreshDatas();
          });
        }
      });
    }

    self.removeSpaceDefinitely = function(rule) {

      console.log("remove space definitely in ctrl with space datas", rule);
      return new Promise(function(resolve, reject) {
        userData.removeSpaceDefinitely($scope.collaboratorsSpace, rule).then(function(success) {
          resolve(success);
        }).catch(function(error) {
          reject(error);
        });
      });
    }

    self.changeCollaboratorRule = function(collaboratorId, rule) {
      return new Promise(function(resolve, reject) {
        userData.changeCollaboratorRule(collaboratorId, rule).then(function(success) {
          cancelAllAlerts();
          self.changeCollaboratorRuleError = success;

          alertSuccessChangeCollaboratorRuleTimer = $timeout(function() {
            self.alertSuccessChangeCollaboratorRule = false;
          }, timeout);
          self.alertSuccessChangeCollaboratorRule = true;
          resolve(null);
          refreshDatas();
          console.log("changeCollaboratorRule success");
        }).catch(function(error) {
          cancelAllAlerts();
          self.changeCollaboratorRuleError = error.code;

          alertSuccessChangeCollaboratorRuleTimer = $timeout(function() {
            self.alertErrorChangeCollaboratorRule = false;
          }, timeout);
          self.alertErrorChangeCollaboratorRule = true;
          reject(error.code);
          refreshDatas();
          console.log("changeCollaboratorRule error", error);
        })
      });
    }

    self.changeCollaboratorRuleConfirmation = function(collaboratorId, rule) {
      $scope.popupToDo = "changeCollaboratorRule";
      $scope.collaboratorId = collaboratorId;
      $scope.collaboratorRule = rule;
      $scope.changeCollaboratorRule = self.changeCollaboratorRule;
      self.openPopup();
    }

    self.removeCollaboratorConfirmation = function(collaboratorId, spaceId, rule) {
      $scope.popupToDo = "removeCollaborator";
      $scope.collaboratorId = collaboratorId;
      $scope.collaboratorRule = rule;
      $scope.spaceId = spaceId;
      $scope.removeCollaborator = self.removeCollaborator;
      self.openPopup();
    }

    self.addCollaboratorConfirmation = function(collaboratorId, rule) {
      $scope.popupToDo = "addCollaborator";
      $scope.collaboratorId = collaboratorId;
      $scope.collaboratorRule = rule;
      $scope.addCollaborator = self.addCollaborator;
      self.openPopup();
    }

    self.removeSpaceDefinitelyConfirmation = function(rule) {
      $scope.popupToDo = "removeSpaceDefinitely";
      $scope.collaboratorRule = rule;
      $scope.removeSpaceDefinitely = self.removeSpaceDefinitely;
      self.openPopup();
    }

    self.openPopup = function() {
      ngDialog.open({
        controller: 'PopupController',
        templateUrl: 'popup/popupTmpl.html',
        showClose: false,
        scope: $scope
      });
    }

    function refreshDatas() {
      if (!$rootScope.$$phase)
        $rootScope.$apply();
    }

    function cancelAllAlerts() {

      self.addCollaboratorError = false;
      self.alertErrorChangeCollaboratorRule = false;
      self.changeCollaboratorRuleError = false;
      self.spaceUpdateError = false;
      self.alertErrorSave = false;
      self.alertSuccessSave = false;
      self.alertSuccessAddCollaborator = false;
      self.alertErrorAddCollaborator = false;
      self.alertErrorDuplicateAddCollaborator = false;
      self.alertSuccessChangeCollaboratorRule = false;
      self.alertSuccessRemoveCollaborator = false;
      self.alertErrorRemoveCollaborator = false;
      $timeout.cancel(alertSuccessSaveTimer);
      $timeout.cancel(alertErrorSaveTimer);
      $timeout.cancel(alertSuccessAddCollaboratorTimer);
      $timeout.cancel(alertErrorAddCollaboratorTimer);
      $timeout.cancel(alertErrorDuplicateAddCollaboratorTimer);
      $timeout.cancel(alertSuccessChangeCollaboratorRuleTimer);
      $timeout.cancel(alertErrorChangeCollaboratorRuleTimer);
      $timeout.cancel(alertSuccessRemoveCollaboratorTimer);
      $timeout.cancel(alertErrorRemoveCollaboratorTimer);
    }

    $scope.$on("$destroy", function() {

      // Unsubscription from all user spaces
      userData.userSpaceUnsubscription();

      // Unsubscription from the user data
      userData.userDataRef.off("value", userData.userSubscription);

      self.name = "";
      self.surname = "";

      console.log("good bye space Edition");
    });

  }
]);
