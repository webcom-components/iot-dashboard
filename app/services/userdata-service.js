'use strict';

/** Importation **/
import 'webcom/webcom.js'; // webcom module
import 'angular-sanitize';
import 'angular-translate';
import 'angular-translate-loader-static-files';

import "./auth-service.js";

/** Create userdata module **/
var userDataModule = angular.module('userDataModule', ['pascalprecht.translate', 'myConfigModule', 'authenticationModule']);

/** Define userdata service **/
userDataModule.service('userData', [
  '$rootScope',
  'authentication',
  '$translate',
  'myConfigService',
  '$location',

  function($rootScope, authentication, $translate, myConfigService, $location) {

    var self = {};
    var spacesUrl = undefined;
    var usersUrl = undefined;
    var collaboratorsDataRef = null;
    var userId = null; // User ID

    // Create a connection to the back-end
    self.serviceInit = function() {
      spacesUrl = myConfigService.datasyncUri + '/spaces';
      usersUrl = myConfigService.datasyncUri + '/users';
      self.ref = new Webcom(myConfigService.datasyncUri);
      self.spacesRef = new Webcom(spacesUrl);
      self.usersRef = new Webcom(usersUrl);
      self.userSpaceInfos = [];
      self.spaceSubId = [];
      self.userSnapshot = null;
      self.spaceSnapshot = null;
      self.selectedSpaceID = null;
      self.spaceUpdateError = undefined;
      authentication.serviceInit();
      self.doneTest = true;
    }
    self.serviceInit();

    /** Initialization user data function **/
    self.userDataInit = function() {

      userId = authentication.getMyUid();
      console.log("userdataID", userId);

      // Create a connection to the back-end
      self.userDataRef = new Webcom(usersUrl + "/" + userId);
    }

    /** The user webcom subscription function **/
    self.userSubscription = function(snapshot) {

      self.userSnapshot = snapshot;

      // If the user has information
      if (snapshot.val() != null) {

        var languages = localStorage.getItem("languages").split(",");

        var preferla = snapshot.val().prefLang;

        if (preferla != "auto") {

          $translate.use(preferla);

        } else {

          var i = 0;
          for (; i < languages.length; i++) {
            // If the navigator language is available
            if (window.navigator.language == languages[i]) {

              $translate.use(window.navigator.language);

              break;

            } else {

              $translate.use('en');

            }
          }
        }
      }

      if (snapshot.child("spaces").val() != null) {

        // Unsubscription
        self.userSpaceUnsubscription();

        // Get all space ID in String
        self.spaceIdList = Object.getOwnPropertyNames(snapshot.child("spaces").val());

        // Subscription
        self.userSpaceSubscription();

      } else { // If all children are removed

        // Unsubscription
        self.userSpaceUnsubscription();
        refreshDatas();

      }

    };

    /** The space webcom subscription function **/
    self.spaceSubscription = function(snapshot) {

      var spaceCollaboratorsId = Object.getOwnPropertyNames(snapshot.child("users").val());
      self.spaceSnapshot = snapshot;

      if (snapshot.val() !== null) {
        var i = 0;
        for (; i < self.userSpaceInfos.length; i++) {
          // For the right space we recover the right information (Comparaison beetwen the space ID)
          if (self.userSpaceInfos[i].id == snapshot.val().id) {
            self.userSpaceInfos[i].spaceName = snapshot.val().name;
            self.userSpaceInfos[i].spaceDescription = snapshot.val().description;
            console.log("snapshot.val().name", snapshot.val().name);
            self.userSpaceInfos[i].users = [];
            var j = 0;
            for (; j < spaceCollaboratorsId.length; j++) {

              self.userSpaceInfos[i].users.push(new createIdObject(spaceCollaboratorsId[j]));
              self.userSpaceInfos[i].users[j].role = snapshot.child("users").child(spaceCollaboratorsId[j]).val().role;
              collaboratorsDataRef = new Webcom(usersUrl + "/" + spaceCollaboratorsId[j] + "/name");
              collaboratorsDataRef.once("value", collaboratorNameSubscription(i, j));
              collaboratorsDataRef = new Webcom(usersUrl + "/" + spaceCollaboratorsId[j] + "/surname");
              collaboratorsDataRef.once("value", collaboratorSurnameSubscription(i, j));
            }
            break;
          }
        }
      }
    }

    /** The user space webcom subscription function **/
    self.userSpaceSubscription = function() {

      self.userSpaceInfos = [];

      var i = 0;
      console.log("LENGTH", self.spaceIdList.length);
      for (; i < self.spaceIdList.length; i++) {

        // Add an element (JSON) in the table
        self.userSpaceInfos.push(new createIdObject(self.spaceIdList[i]));

        self.spaceSubId[i] = self.spaceIdList[i];

      }
      var i = 0;
      for (; i < self.spaceIdList.length; i++) {

        // Create a connection to the back-end for each space
        var userSpace = new Webcom(spacesUrl + "/" + self.spaceIdList[i] + "/settings");

        userSpace.on("value", self.spaceSubscription);

      }
      console.log("LENGTH 1", self.userSpaceInfos.length);
    }

    /** Unsubscription from the spaces **/
    self.userSpaceUnsubscription = function() {

      self.userSpaceInfos = [];
      var i = 0;
      for (; i < self.spaceSubId.length; i++) {

        // Create a connection to the back-end for each space
        var userSpace = new Webcom(spacesUrl + "/" + self.spaceSubId[i] + "/settings");
        userSpace.off("value", self.spaceSubscription);
        self.spaceSubId[i] = [];

      }

    }

    /** Set user data function **/
    self.setUserData = function(name, surname, email, preferredLanguage) {

      name = name.charAt(0).toUpperCase() + name.substr(1).toLowerCase();
      surname = surname.toUpperCase();

      return new Promise(function(resolve, reject) {
        self.userDataRef.update({
          "name": name,
          "surname": surname,
          "email": email,
          "prefLang": preferredLanguage
        }, function(error) {
          if (error) {
            reject(error);
            //refreshDatas();

          } else {
            resolve(null);
            refreshDatas();

          }
        });
      });
    }

    /** space update **/
    self.updateSpace = function(spaceName, spaceDescription) {
      return new Promise(function(resolve, reject) {
        self.spacesRef.child(self.selectedSpaceID).child("settings").update({
          "name": spaceName,
          "description": spaceDescription
        }, function(error) {
          if (error === null) {
            resolve(null);
            refreshDatas();

          } else {
            reject(error);
            //refreshDatas();

          }
        });
      });

    }

    /** space creation function **/
    self.createSpace = function(spaceName) {
      var pushError = undefined;
      var setError = undefined;
      return new Promise(function(resolve, reject) {

        // If the user don't mention his profil information
        if (self.userSnapshot.val() === null) {

          self.userInfosError = true;
          reject(null);
          //refreshDatas();

        } else {

          self.userInfosError = false;
          var space = {
            settings: {
              name: spaceName,
              users: {},
              adminIndex: {}
            }
          };

          space.settings.users[authentication.getMyUid()] = {
            role: "admin"
          }


          space.settings.adminIndex[authentication.getMyUid()] = true;

          // Creation of the space with the ID generated by push()
          var spacePush = self.spacesRef.push(space, function(error) {
            if (error) {
              pushError = error;
              reject(pushError.code);
              //refreshDatas();

            } else {
              pushError = null;

              // Recuperate the space ID generated by push()
              self.selectedSpaceID = spacePush.name();

              localStorage.setItem("selectedSpaceID", self.selectedSpaceID);

              self.spacesRef.child(self.selectedSpaceID).child("settings").update({
                id: spacePush.name()
              }, function(setSpaceIdError) {
                if (setSpaceIdError) {
                  setError = setSpaceIdError;
                } else {
                  setError = null;
                }

                if (pushError === null && setError === null) {
                  self.userDataRef.child("spaces").child(self.selectedSpaceID).set({
                    exist: "true"
                  }, function(error) {
                    if (error) {
                      setError = error;
                    } else {
                      setError = null;
                    }

                    if (pushError === null && setError === null) {
                      resolve(null);
                      refreshDatas();

                    } else {
                      if (pushError !== null) {
                        reject(pushError.code);
                        //refreshDatas();

                      } else if (setError !== null) {
                        reject(setError.code);
                        //refreshDatas();

                      }
                    }
                  });
                } else {
                  if (pushError !== null) {
                    reject(pushError.code);
                    //refreshDatas();

                  } else if (setError !== null) {
                    self.spacesRef.child(spacePush.name()).remove(function() {
                      reject(setError.code);
                      //refreshDatas();

                    });
                  }
                }
              });
            }

          });

        }
      });
    }

    /** Space dereliction function **/
    self.leaveSpace = function(spaceId) {
      return new Promise(function(resolve, reject) {
        self.spacesRef.child(spaceId).child("settings").child("users").child(userId).once("value", function(usersSnapshot) {
          console.log("MMMMMMMMMMMMMM");

          if (usersSnapshot.val().role === "admin") {
            self.spacesRef.child(spaceId).child("settings").child("adminIndex").once("value", function(adminIndexSnapshot) {
              console.log("adminIndexSnapshot.numChildren()", adminIndexSnapshot.numChildren());
              if (adminIndexSnapshot.numChildren() > 1) {
                internalLeaveSpace(spaceId).then(function(success) {
                  resolve(success);
                }).catch(function(error) {
                  reject(error);
                });
              } else {
                var returnedError = {
                  code: "LAST_ADMIN"
                }
                reject(returnedError);
                //refreshDatas();

                console.log("cannot delete because this is the last admin");
              }
            });
          } else {
            internalLeaveSpace(spaceId).then(function(success) {
              resolve(success);
            }).catch(function(error) {
              reject(error);
              //refreshDatas();

            });
          }
        }, function(error) {
          reject(error)
        });
      });
    }

    self.removeCollaborator = function(collaboratorId, spaceId, isAdmin) {
      return new Promise(function(resolve, reject) {

        if (isAdmin === true) {
          self.spacesRef.child(spaceId).child("settings").child("users").child(collaboratorId).once("value", function(usersSnapshot) {
            if (usersSnapshot.val().role === "admin") {
              self.spacesRef.child(spaceId).child("settings").child("adminIndex").once("value", function(adminIndexSnapshot) {
                console.log("adminIndexSnapshot.numChildren()", adminIndexSnapshot.numChildren());
                if (adminIndexSnapshot.numChildren() > 1) {

                  self.usersRef.child(collaboratorId).child("spaces").child(spaceId).remove(function(userError) {
                    if (userError === null) {
                      self.spacesRef.child(spaceId).child("settings").child("adminIndex").child(collaboratorId).remove(function(adminIndexError) {
                        if (adminIndexError === null) {
                          self.spacesRef.child(spaceId).child("settings").child("users").child(collaboratorId).remove(function(spaceError) {
                            if (spaceError === null) {
                              resolve(null);
                              refreshDatas();
                              if (collaboratorId === userId) {
                                localStorage.removeItem("selectedSpaceID");
                                $location.path("/user");
                                refreshDatas();

                              }

                            } else {
                              reject(spaceError);
                              //refreshDatas();

                            }
                          });

                        } else {
                          reject(adminIndexError);
                          //refreshDatas();

                        }
                      });

                    } else {
                      reject(userError);
                      //refreshDatas();

                    }
                  });

                } else {
                  var returnedError = {
                    code: "LAST_ADMIN"
                  }
                  reject(returnedError);
                  //refreshDatas();

                  console.log("cannot delete because this is the last admin");
                }
              });
            } else {
              self.usersRef.child(collaboratorId).child("spaces").child(spaceId).remove(function(userError) {
                if (userError === null) {
                  self.spacesRef.child(spaceId).child("settings").child("adminIndex").child(collaboratorId).remove(function(adminIndexError) {
                    if (adminIndexError === null) {
                      self.spacesRef.child(spaceId).child("settings").child("users").child(collaboratorId).remove(function(spaceError) {
                        if (spaceError === null) {
                          resolve(null);
                          refreshDatas();

                        } else {
                          reject(spaceError);
                          //refreshDatas();

                        }
                      });
                      if (collaboratorId === userId) {
                        localStorage.removeItem("selectedSpaceID");
                        $location.path("/user");
                        refreshDatas();

                      }
                    } else {
                      reject(adminIndexError);
                      //refreshDatas();

                    }
                  });
                } else {
                  reject(userError);
                  //refreshDatas();

                }
              });
            }
          });
        } else {
          var returnedError = {
            code: "NOT_ADMIN"
          }
          reject(returnedError);
          //refreshDatas();

          console.log("cannot delete because your rule is not an admin");
        }
      });
    }

    self.navSpaceEdition = function(spaceId) {

      self.selectedSpaceID = spaceId;
      localStorage.setItem("selectedSpaceID", self.selectedSpaceID);

      // Unsubscription
      self.userSpaceUnsubscription();
      // Subscription
      self.userSpaceSubscription();

    }

    function removeSpaceFromCollaborator(collaboratorId) {

      //var collaboratorRefToRemove = null;
      return new Promise(function(resolve, reject) {
        //  collaboratorRefToRemove = new Webcom(usersUrl + "/" + collaboratorId);

        self.usersRef.child(collaboratorId).child("spaces").child(self.selectedSpaceID).remove(function(error) {

          if (error === null) {

            resolve(null);
            refreshDatas();

          } else {
            reject(error);
            console.log("error reject removeSpaceFromCollaborator", error);
            //refreshDatas();

          }
        });

      });

    }

    self.removeSpaceDefinitely = function(collaboratorsSpace, rule) {

      console.log("im remove space definitely into service", userId, collaboratorsSpace, rule);
      return new Promise(function(resolve, reject) {
        if (rule) {
          var promises = [];

          for (var j = 0; j < collaboratorsSpace.length; j++) {
            console.log("collaboratorsSpace[j].id", collaboratorsSpace[j].id);

            promises.push(removeSpaceFromCollaborator(collaboratorsSpace[j].id));

          }
          Promise.all(promises).then(function() {
            // returned data is in arguments[0], arguments[1], ... arguments[n]
            // you can process it here
            self.spacesRef.child(self.selectedSpaceID).remove(function(error) {
              if (error === null) {
                console.log("space removed definitely");
                resolve(null);
                $location.path("/user");
                refreshDatas();

              } else {
                console.log("space not removed definitely");
                reject(error);
                //refreshDatas();

              }
            });

          }, function(err) {
            // error occurred
            reject(err);
            console.log("problem with removing collaborators", err);
            //refreshDatas();

          });
        } else {
          var returnedError = {
            code: "NOT_ADMIN"
          }
          reject(returnedError);
          //refreshDatas();

        }
      });

    }

    self.addCollaborator = function(collaboratorId, rule) {

      if (rule === "Administrator") {
        rule = "admin";
      } else {
        rule = "member";
      }
      return new Promise(function(resolve, reject) {
        verifExistCollaborator(collaboratorId).then(function() {
          var obj = {};
          obj[collaboratorId] = true;

          self.spacesRef.child(self.selectedSpaceID).child("settings").child("users").child(collaboratorId).set({
            "role": rule
          }, function(spaceError) {
            if (spaceError) {
              reject(spaceError)
            } else {
              if (rule == "admin") {
                self.spacesRef.child(self.selectedSpaceID).child("settings").child("adminIndex").update(obj,
                  function(indexError) {
                    console.log("indexError", indexError);
                    if (indexError) {
                      reject(indexError)
                    } else {
                      self.usersRef.child(collaboratorId).child("spaces").child(self.selectedSpaceID).set({
                        "exist": true
                      }, function(error) {
                        if (error) {
                          reject(error)
                        } else {
                          console.log("addCollaborator done");
                          resolve(null);
                        }
                      });
                    }
                  })
              } else {
                self.usersRef.child(collaboratorId).child("spaces").child(self.selectedSpaceID).set({
                  "exist": true
                }, function(error) {
                  if (error) {
                    reject(error)
                  } else {
                    console.log("addCollaborator done");
                    resolve(null);
                  }
                });
              }

            }
          });

        }).catch(function() {
          var returnedError = {
            code: "USER_DOESNT_EXIST"
          }
          reject(returnedError);

        });
      });
    }

    self.changeCollaboratorRule = function(collaboratorId, newRule) {

      if (newRule === "Administrator") {
        newRule = "admin";
      } else {
        newRule = "member"
      }
      return new Promise(function(resolve, reject) {

        self.spacesRef.child(self.selectedSpaceID).child("settings").child("users").child(collaboratorId).once("value", function(usersSnapshot) {
          if (usersSnapshot.val().role === "admin") {
            self.spacesRef.child(self.selectedSpaceID).child("settings").child("adminIndex").once("value", function(adminIndexSnapshot) {
              console.log("adminIndexSnapshot.numChildren()", adminIndexSnapshot.numChildren());
              if (adminIndexSnapshot.numChildren() > 1) {
                internalChangeCollaboratorRule(collaboratorId, newRule).then(function(success) {
                  resolve(success);
                }).catch(function(error) {
                  reject(error);
                });
              } else {
                var returnedError = {
                  code: "LAST_ADMIN"
                }
                reject(returnedError);
                //refreshDatas();

                console.log("cannot change rule because this is the last admin");
              }
            });
          } else {
            internalChangeCollaboratorRule(collaboratorId, newRule).then(function(success) {
              resolve(success);
            }).catch(function(error) {
              reject(error);
            });
          }
        });

      });
    }

    function internalChangeCollaboratorRule(collaboratorId, newRule) {
      return new Promise(function(resolve, reject) {
        var obj = {};
        obj[collaboratorId] = true;
        if (newRule == "admin") {
          self.spacesRef.child(self.selectedSpaceID).child("settings").child("adminIndex").update(obj, function(indexError) {
            console.log("indexError", indexError);
            if (indexError) {
              reject(indexError)
            } else {
              self.spacesRef.child(self.selectedSpaceID).child("settings").child("users").child(collaboratorId).set({
                "role": newRule
              }, function(spaceError) {
                if (spaceError) {
                  reject(spaceError)
                  //refreshDatas();
                } else {
                  console.log("changeCollaboratorRule done");
                  resolve(null);
                  refreshDatas();
                }
              });
            }
          });
        } else {
          self.spacesRef.child(self.selectedSpaceID).child("settings").child("adminIndex").child(collaboratorId).remove(function(removeIndexError) {
            console.log("removeIndexError", removeIndexError);
            if (removeIndexError) {
              reject(removeIndexError)
            } else {
              self.spacesRef.child(self.selectedSpaceID).child("settings").child("users").child(collaboratorId).set({
                "role": newRule
              }, function(spaceError) {
                if (spaceError) {
                  reject(spaceError)
                  //refreshDatas();
                } else {
                  console.log("changeCollaboratorRule done");
                  resolve(null);
                  refreshDatas();
                }
              });
            }
          });
        }

      });
    }

    function internalLeaveSpace(spaceId) {
      return new Promise(function(resolve, reject) {
        self.userDataRef.child("spaces").child(spaceId).remove(function(error) {
          if (error === null) {
            self.spacesRef.child(spaceId).child("settings").child("users").child(userId).remove(function(spaceError) {
              if (spaceError === null) {
                resolve(null);
                refreshDatas();
              } else {
                reject(spaceError);
                //refreshDatas();
              }
            });
            localStorage.removeItem("selectedSpaceID");
          } else {
            reject(error);
            //refreshDatas();
          }
        });
      });
    }

    function collaboratorNameSubscription(i, j) {
      return function(snapshot) {
        console.log("snap collaboratorNameSubscription", snapshot.val());

        self.userSpaceInfos[i].users[j].name = snapshot.val();

        refreshDatas();
      }
    }

    function collaboratorSurnameSubscription(i, j) {
      return function(snapshot) {
        console.log("snap collaboratorSurnameSubscription", snapshot.val());
        self.userSpaceInfos[i].users[j].surname = snapshot.val();

        refreshDatas();
      }
    }

    function verifExistCollaborator(collaboratorId) {

      return new Promise(function(resolve, reject) {
        self.usersRef.child(collaboratorId).child("name").once("value", function(snapshot) {
          if (snapshot.val() != null) {
            resolve()
          } else {
            reject();
          }
        });
      })
    }

    /** Creation of a table of JSON Objects **/
    function createIdObject(id) {
      this.id = id;
    }

    /** Refresh application function **/
    function refreshDatas() {
      if (!$rootScope.$$phase)
        $rootScope.$apply();
    }

    return self;
  }
]);
