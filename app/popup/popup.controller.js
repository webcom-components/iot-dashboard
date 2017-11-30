'use strict';

/** Import the space edition module from the file **/
import myPopup from './popup.module.js';

myPopup.controller('PopupController', ['$rootScope', '$scope', 'ngDialog', function($rootScope, $scope, ngDialog) {
  var Done = false;

  $scope.popupValidate = function() {
    // FIXME improve : remove lot of "if" - make this generic
    // use a callback ? 

    if ($scope.$parent.popupToDo === "changeCollaboratorRule") {
      $scope.$parent.changeCollaboratorRule($scope.$parent.collaboratorId, $scope.$parent.collaboratorRule).then(function() {
        Done = true;
        ngDialog.close();
      }).catch(function() {
        ngDialog.close();
      });
    } else if ($scope.$parent.popupToDo === "removeCollaborator") {
      $scope.$parent.removeCollaborator($scope.$parent.collaboratorId, $scope.$parent.spaceId, $scope.$parent.collaboratorRule).then(function() {
        Done = true;
        ngDialog.close();
      }).catch(function() {
        ngDialog.close();
      });
    } else if ($scope.$parent.popupToDo === "addCollaborator") {
      $scope.$parent.addCollaborator($scope.$parent.collaboratorId, $scope.$parent.collaboratorRule).then(function() {
        Done = true;
        ngDialog.close();
      }).catch(function() {
        ngDialog.close();
      });
    } else if ($scope.$parent.popupToDo === "removeSpaceDefinitely") {
      $scope.$parent.removeSpaceDefinitely($scope.$parent.collaboratorRule).then(function() {
        Done = true;
        ngDialog.close();
      }).catch(function() {
        ngDialog.close();
      });
    } else if ($scope.$parent.popupToDo === "leaveSpace") {
      $scope.$parent.leaveSpace($scope.$parent.spaceId).then(function() {
        Done = true;
        ngDialog.close();
      }).catch(function() {
        ngDialog.close();
      });
    }
  }

  $scope.closePopup = function() {
    if (Done == false && $scope.$parent.popupToDo === "changeCollaboratorRule") {
      var i = 0;
      for (; i < $scope.$parent.saveCollaboratorsSpaceInfosBeforePopup.length; i++) {
        if ($scope.$parent.saveCollaboratorsSpaceInfosBeforePopup[i].id == $scope.$parent.collaboratorId) {
          $scope.$parent.collaboratorsSpace[i].role = $scope.$parent.saveCollaboratorsSpaceInfosBeforePopup[i].role;
          break;
        }
      }
    }
    ngDialog.close();
  }

  $scope.$on("$destroy", function() {
    if (Done == false && $scope.$parent.popupToDo === "changeCollaboratorRule") {
      var i = 0;
      for (; i < $scope.$parent.saveCollaboratorsSpaceInfosBeforePopup.length; i++) {
        if ($scope.$parent.saveCollaboratorsSpaceInfosBeforePopup[i].id == $scope.$parent.collaboratorId) {
          $scope.$parent.collaboratorsSpace[i].role = $scope.$parent.saveCollaboratorsSpaceInfosBeforePopup[i].role;
          if (!$rootScope.$$phase)
            $rootScope.$apply();
          break;
        }
      }
    }
    console.log("good bye popup controller");
  });
}]);
