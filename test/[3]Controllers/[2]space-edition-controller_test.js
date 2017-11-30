// Tests here

import 'angular';
import 'angular-route';
import 'angular-mocks';

import '../../app/spaceedition/spaceEdition.controller.js';
import 'webcom/webcom.js';
import 'ng-dialog';


describe('controller: spaceEditionController', function() {
  var ctrl,
    userData,
    scope,
    authentication,
    myConfigService,
    securityRules = false,
    deferred = undefined,
    rule = false;

  var originalTimeout;
  var collaboratorsIdSpace = ['UserId1', 'UserId2', 'UserId3'];
  var spaceId = "spaceId";

  beforeEach(angular.mock.module('myConfigModule'));
  beforeEach(angular.mock.module('myApp.spaceedition'));

  beforeEach(angular.mock.inject(function(_myConfigService_) {
    myConfigService = _myConfigService_;
  }));

  beforeEach(angular.mock.inject(function($controller, $rootScope, $q, $timeout) {
    scope = $rootScope.$new();
    userData = {
      userDataRef: new Webcom(myConfigService.datasyncUri),
      userSpaceInfos: [],
      updateSpace: function(spaceName, spaceDescription) {
        return new Promise(function(resolve, reject) {
          if (securityRules) {
            resolve(null)
          } else {
            reject("error");
          }
        });
      },
      removeSpaceFromCollaborator: function(collaboratorId) {

        return new Promise(function(resolve, reject) {
          if (securityRules) {

            resolve(null);
            if (!$rootScope.$$phase)
              $rootScope.$apply();
            }
          else {
            var returnedError = {
              code: "permission_denied"
            }
            reject(returnedError);
            if (!$rootScope.$$phase)
              $rootScope.$apply();
            }
          });
      },

      removeSpaceDefinitely: function(collaboratorsSpace, rule) {

        return new Promise(function(resolve, reject) {
          if (rule) {
            var promises = [];
            for (var j = 0; j < collaboratorsIdSpace.length; j++) {
              console.log("collaboratorsSpace[j]", collaboratorsIdSpace[j]);

              promises.push(new userData.removeSpaceFromCollaborator(collaboratorsIdSpace[j]));

            }
            Promise.all(promises).then(function() {
              if (securityRules) {
                resolve(null);
                if (!$rootScope.$$phase)
                  $rootScope.$apply();
                }
              else {
                var returnedError = {
                  code: "permission_denied"
                }
                reject(returnedError);
                if (!$rootScope.$$phase)
                  $rootScope.$apply();
                }
              }, function(err) {
              // error occurred
              reject(err);

              if (!$rootScope.$$phase)
                $rootScope.$apply();
              }
            );
          } else {
            var returnedError = {
              code: "NOT_ADMIN"
            }
            reject(returnedError);
            if (!$rootScope.$$phase)
              $rootScope.$apply();
            }
          });
      },

      addCollaborator: function(collaboratorId, role) {
        if (role === "Administrator") {
          role = "admin";
        } else {
          role = "member"
        }
        return new Promise(function(resolve, reject) {

          if (securityRules) {

            userData.userSpaceInfos = [];
            userData.userSpaceInfos.push(new userData.createIdObject("spaceId"));

            userData.userSpaceInfos[0].spaceName = "Test";

            userData.userSpaceInfos[0].spaceDescription = "Description";
            userData.userSpaceInfos[0].users = [];
            userData.userSpaceInfos[0].users.push(new userData.createIdObject(collaboratorId));
            userData.userSpaceInfos[0].users[0].name = "User";
            userData.userSpaceInfos[0].users[0].role = role;
            userData.userSpaceInfos[0].users[0].surname = "Test";

            resolve(null)
            if (!$rootScope.$$phase)
              $rootScope.$apply()
          } else {
            reject("error");
            if (!$rootScope.$$phase)
              $rootScope.$apply()
          }
        });

      },
      changeCollaboratorRule: function(collaboratorId, role) {
        if (role === "Administrator") {
          role = "admin";
        } else {
          role = "member"
        }
        return new Promise(function(resolve, reject) {

          if (securityRules) {
            userData.userSpaceInfos[0].users[0].role = role;
            resolve(null)
            if (!$rootScope.$$phase)
              $rootScope.$apply()
          } else {
            reject("error");
            if (!$rootScope.$$phase)
              $rootScope.$apply()
          }
        });
      },

      createIdObject: function(id) {
        this.id = id;
      },
      userSpaceUnsubscription: function() {},

      userSubscription: function() {},

      userDataInit: function() {}
    };

    ctrl = $controller('spaceEditionController', {
      userData: userData,
      $scope: scope,
      authentication: authentication
    });

  }));

    describe('Update information', function() {

      beforeEach(function() {
        userData.userSpaceInfos = [""];
        ctrl.selectedSpaceID = "spaceId"
        localStorage.setItem("selectedSpaceID", "spaceId");
      })
      it("Shouldn't let us update information", function(done) {
        ctrl.disableSaveData = true;
        ctrl.updateSpace('spaceName', 'description').then(function() {
          expect(ctrl.alertSuccessSave).toBe(false);
          expect(ctrl.disableSaveData).toBe(false);
          expect(ctrl.disableReset).toBe(false);
          expect(ctrl.modify).toBe("Save");
          done();
        }).catch(function() {
          fail("update error");
        });

      });

      it("Should let us update information and Should update information", function(done) {
        securityRules = true;
        ctrl.disableSaveData = false;

        ctrl.updateSpace('spaceName', 'description').then(function() {
          expect(ctrl.alertSuccessSave).toBe(true);
          expect(ctrl.alertErrorSave).toBe(false);
          expect(ctrl.disableSaveData).toBe(true);
          expect(ctrl.modify).toBe("Modify");
          done();
        }).catch(function() {
          fail("update error");
        });
      });

      it("Should let us update information and Shouldn't update information", function(done) {
        securityRules = false;
        ctrl.disableSaveData = false;

        ctrl.updateSpace('spaceName', 'description').then(function() {
          fail("update error");
        }).catch(function() {
          expect(ctrl.alertSuccessSave).toBe(false);
          expect(ctrl.alertErrorSave).toBe(true);
          expect(ctrl.disableSaveData).toBe(false);
          expect(ctrl.modify).toBe("Save");
          done();
        });
      });
    });

    describe('Add collaborator', function() {

      beforeEach(function() {
        userData.userSpaceInfos = [""];
        ctrl.selectedSpaceID = "spaceId"
        localStorage.setItem("selectedSpaceID", "spaceId");
      })

      it("Should add collaborator", function(done) {

        securityRules = true;
        ctrl.addCollaborator('UserId', 'Administrator').then(function() {
          expect(scope.collaboratorsSpace[0].name).toBe("User");
          expect(scope.collaboratorsSpace[0].surname).toBe("Test");
          expect(scope.collaboratorsSpace[0].role).toBe("Administrator");
          done();
        }).catch(function() {
          fail("add Collaborator error");
        });
      });

    });

    describe('Add collaborator', function() {

      it("Shouldn't add collaborator", function(done) {

        securityRules = false;
        ctrl.addCollaborator('UserId', 'Administrator').then(function() {
          fail("add Collaborator error");
        }).catch(function() {
          expect(scope.collaboratorsSpace).toBe(undefined);
          done();

        });
      });
    });

    describe('Change collaborator rule', function() {

      beforeEach(function(done) {
        securityRules = true;
        ctrl.addCollaborator('UserId', 'Administrator').then(function() {
          done();
        }).catch(function() {
          fail("add Collaborator error");
        });
      });

      it("Should change collaborator rule", function(done) {

        securityRules = true;
        ctrl.changeCollaboratorRule('UserId', 'Member').then(function() {
          expect(scope.collaboratorsSpace[0].role).toBe("Member");
          done();
        }).catch(function(error) {
          console.log(error);
          fail("Change Collaborator rule error");
        });
      });

    });

    describe('Change collaborator rule', function() {

      beforeEach(function(done) {
        securityRules = true;
        userData.userSpaceInfos = [""];
        ctrl.addCollaborator('UserId', 'Administrator').then(function() {
          done();
        }).catch(function() {
          fail("add Collaborator error");
        });
      });

      it("Shouldn't change collaborator rule", function(done) {

        securityRules = false;
        ctrl.changeCollaboratorRule('UserId', 'Member').then(function() {
          fail("Change Collaborator rule error");
        }).catch(function() {
          expect(scope.collaboratorsSpace[0].role).toBe("Administrator");
          done();

        });
      });
    });

  describe('Remove Space Definitely with securityRule=true and rule=admin', function() {

    it("Should Remove space Definitely  ", function(done) {

      securityRules = true;
      rule = true;

      ctrl.removeSpaceDefinitely(rule).then(function() {
        done();
      }).catch(function() {
        fail("couldn't remove Space Definitely");
      });
    });

  });

  describe('Remove Space Definitely with securityRules=true and rule=member', function() {


    it("Shouldn't  Remove space Definitely ", function(done) {

      securityRules = true;
      rule = false;

      ctrl.removeSpaceDefinitely(rule).then(function() {
        fail("couldn't remove Space Definitely");
      }).catch(function() {
        done();
      });
    });

  });

  describe('Remove Space Definitely with securityRules=false and rule=admin', function() {

    it("Shouldn't Remove space Definitely ", function(done) {

      securityRules = false;
      rule = true;

      ctrl.removeSpaceDefinitely(rule).then(function() {
        fail("couldn't remove Space Definitely");
      }).catch(function() {
        done();
      });
    });

  });

  describe('Remove Space Definitely with securityRules=false and rule=member', function() {


    it("Remove space Definitely ", function(done) {

      securityRules = false;
      rule = false;

      ctrl.removeSpaceDefinitely(rule).then(function() {
        fail("couldn't remove Space Definitely");

      }).catch(function() {
        done();
      });
    });

  });

});
