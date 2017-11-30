'use strict';

import mySensors from './sensors.module.js';

mySensors.controller('SensorsController', [
  'myConfigService',
  '$rootScope',
  '$scope',
  '$routeParams',
  'authentication',

  function(myConfigService, $rootScope, $scope, $routeParams, authentication) {
    var spaceIdLocalStorage = $routeParams.spaceId;
    var spaceId = "/" + spaceIdLocalStorage + "/";
    console.log("im sensors controller for space id ", spaceIdLocalStorage);
    const spacesUrl = myConfigService.datasyncUri + '/spaces';
    var spaceRef = new Webcom(spacesUrl + spaceId);
    var self = this;
    var nodesIdLastValues = [];
    var networkRef = new Webcom(spacesUrl + spaceId + "/network");
    var lastValueRef = new Webcom(spacesUrl + spaceId + "/lastValue");
    var actuatorsRef = new Webcom(spacesUrl + spaceId + "/actuators");
    var timeOffsetRef = new Webcom("https://io.datasync.orange.com/base/iot-dashboard/.info/serverTimeOffset");


    self.adminRule = false;
    self.nameToUpdate = null;
    self.descriptionToUpdate = null;
    self.dataSensorsExist = null;
    self.dataSensors = [];
    self.numberData = 0;
    self.sensorId = undefined;
    self.disableUpdateData = false;

    lastValueRef.on("value", lastValueSubscription);

    self.editData = function(sensorId, gatewayId, dataActuatorsExist, nameBeforeUpdate, descriptionBeforeUpdate, nameToUpdate, descriptionToUpdate) {
      if (self.sensorId == null) {
        self.nameToUpdate = nameBeforeUpdate;
        self.descriptionToUpdate = descriptionBeforeUpdate;
        self.sensorId = sensorId;
        self.disableUpdateData = true;

      } else if (self.sensorId == sensorId) {

        self.sensorId = null;
        self.disableUpdateData = false;
        console.log("sensorId & dataActuatorsExist & gatewayId && name && descritpion", sensorId + "/" + dataActuatorsExist + "/" + gatewayId + "/" + self.nameToUpdate + "/" + self.descriptionToUpdate);
        if (dataActuatorsExist == false) {
          return new Promise(function(resolve, reject) {
            networkRef.child(gatewayId).child("sensors").child(sensorId).update({
              "name": self.nameToUpdate,
              "description": self.descriptionToUpdate

            }, function(error) {
              if (error) {
                reject(error);
                //refreshDatas();

              } else {
                resolve(null);
                self.disableUpdateData = false;
                self.nameToUpdate = null;
                self.descriptionToUpdate = null;

              }
            });
          });

        } else if (dataActuatorsExist == true) {

          return new Promise(function(resolve, reject) {
            networkRef.child(gatewayId).child("actuators").child(sensorId).update({
              "name": self.nameToUpdate,
              "description": self.descriptionToUpdate

            }, function(error) {
              if (error) {
                reject(error);
                //refreshDatas();

              } else {
                resolve(null);

                self.nameToUpdate = null;
                self.descriptionToUpdate = null;

              }
            });
          });
        }

      }

    }

    self.switchLight = function(gtwId, objId, value) {

      timeOffsetRef.once("value", function(snap) {
        var timeOffset = snap.val();
        console.log("server time offset changed :" + timeOffset);
        var serverTime = new Date().getTime() + timeOffset;

        actuatorsRef.child(gtwId).push({
          expires: serverTime + 2000,
          msg: {
            value: value,
            id: objId
          }
        }, function(error) {
          console.log("lightOn Push error", error);
        });

        if (!$rootScope.$$phase)
          $rootScope.$apply();
      }, function(timeOffsetError) {
        console.log("lightOn Push error", timeOffsetError);
      });
    }

    function verifAdminRuleSubscription(snapshot) {
      var userId = undefined;
      userId = authentication.getMyUid();
      if (snapshot.child("settings").val() !== null) {
        if (snapshot.child("settings").child("users").child(userId).val().role == "admin") {
          self.adminRule = true;
          if (!$rootScope.$$phase)
            $rootScope.$apply();
        } else {
          self.adminRule = false;
          if (!$rootScope.$$phase)
            $rootScope.$apply();
        }
      }
    }

    function lastValueSubscription(snapshot) {
      nodesIdLastValues = [];
      self.dataSensors = [];
      self.dataSensorsExist = snapshot.val();
      if (self.dataSensorsExist !== null) {
        console.log("snapshot.val() last value", snapshot.val());
        var i = 0;
        angular.forEach(snapshot.val(), function(value, key) {
          console.log("value", key);

          nodesIdLastValues.push(new createObject(key));
          console.log("nodesIdLastValues", nodesIdLastValues);

          var j = 0;
          nodesIdLastValues[i].objects = [];

          angular.forEach(snapshot.child(key).val(), function(value, key) {

            console.log("value sensor", value);
            nodesIdLastValues[i].objects.push(new createObject(key));
            nodesIdLastValues[i].objects[j].value = value.value;
            nodesIdLastValues[i].objects[j].timestamp = value.timestamp;
            console.log("timestamp", nodesIdLastValues[i].objects[j].timestamp);
            console.log("nodesIdLastValues.sensors", nodesIdLastValues.objects);

            j++;
          });
          i++;
        });
        spaceRef.on("value", verifAdminRuleSubscription);
        networkRef.on("value", networkSubscription);
      } else {
        self.dataSensorsExist = null;
      }
    }

    function networkSubscription(snapshot) {
      self.dataSensors = [];
      self.dataSensorsExist = snapshot.val();

      if (self.dataSensorsExist !== null) {
        for (var i = 0; i < nodesIdLastValues.length; i++) {
          self.dataSensors.push(new createObject(nodesIdLastValues[i].id));
          console.log("nodesIdLastValues[i].id", nodesIdLastValues[i].id);
          if (snapshot.child(nodesIdLastValues[i].id).val() !== null) {

            console.log("snapshot.child(nodesIdLastValues[i].id).val()", snapshot.child(nodesIdLastValues[i].id).val());

            self.dataSensors[i].gatewayType = snapshot.child(nodesIdLastValues[i].id).val().type;

            self.dataSensors[i].objects = [];
            if (undefined !== nodesIdLastValues[i].objects && nodesIdLastValues[i].objects.length) {
              for (var j = 0; j < nodesIdLastValues[i].objects.length; j++) {

                console.log("nodesIdLastValues[i].objects", nodesIdLastValues[i].objects[j]);
                console.log("snapshot.child(nodesIdLastValues[i].id).child(nodesIdLastValues[i].objects[j].id", snapshot.child(nodesIdLastValues[i].id).child("sensors").child(nodesIdLastValues[i].objects[j].id).val());
                var lastValueDate = new Date(parseInt(nodesIdLastValues[i].objects[j].timestamp));
                console.log("nodesIdLastValues[i].objects[j].timestamp", nodesIdLastValues[i].objects[j].timestamp);
                self.dataSensors[i].objects.push(new createObject(nodesIdLastValues[i].objects[j].id));
                self.dataSensors[i].objects[j].id = nodesIdLastValues[i].objects[j].id;
                self.dataSensors[i].objects[j].value = nodesIdLastValues[i].objects[j].value;
                var day = lastValueDate.getDate();
                var month = lastValueDate.getMonth() + 1;
                var year = lastValueDate.getFullYear();
                var hour = lastValueDate.getHours();
                var min = lastValueDate.getMinutes();
                var sec = lastValueDate.getSeconds();
                self.dataSensors[i].objects[j].dataActuatorsExist = false;
                self.dataSensors[i].objects[j].timestamp = day + "/" + month + "/" + year + " " + hour + ":" + min + ":" + sec;
                if (snapshot.child(nodesIdLastValues[i].id).child("sensors").child(nodesIdLastValues[i].objects[j].id).val() !== null) {
                  self.dataSensors[i].objects[j].dataActuatorsExist = false;
                  self.dataSensors[i].objects[j].name = snapshot.child(nodesIdLastValues[i].id).child("sensors").child(nodesIdLastValues[i].objects[j].id).val().name;
                  self.dataSensors[i].objects[j].gatewayId = nodesIdLastValues[i].id;
                  self.dataSensors[i].objects[j].description = snapshot.child(nodesIdLastValues[i].id).child("sensors").child(nodesIdLastValues[i].objects[j].id).val().description;
                  self.dataSensors[i].objects[j].type = snapshot.child(nodesIdLastValues[i].id).child("sensors").child(nodesIdLastValues[i].objects[j].id).val().type;
                  self.dataSensors[i].objects[j].isAcuator = false;
                  if (!$rootScope.$$phase)
                    $rootScope.$apply();
                }
                if (snapshot.child(nodesIdLastValues[i].id).child("actuators").child(nodesIdLastValues[i].objects[j].id).val() !== null) {
                  self.dataSensors[i].objects[j].dataActuatorsExist = true;
                  self.dataSensors[i].objects[j].name = snapshot.child(nodesIdLastValues[i].id).child("actuators").child(nodesIdLastValues[i].objects[j].id).val().name;
                  self.dataSensors[i].objects[j].gatewayId = nodesIdLastValues[i].id;
                  self.dataSensors[i].objects[j].description = snapshot.child(nodesIdLastValues[i].id).child("actuators").child(nodesIdLastValues[i].objects[j].id).val().description;
                  self.dataSensors[i].objects[j].type = snapshot.child(nodesIdLastValues[i].id).child("actuators").child(nodesIdLastValues[i].objects[j].id).val().type;
                  self.dataSensors[i].objects[j].isAcuator = true;
                  if (!$rootScope.$$phase)
                    $rootScope.$apply();
                }
                console.log("self.dataSensors", self.dataSensors);
              }
            }
          }
        }
      } else {
        self.dataSensorsExist = null;
      }
    }

    function createObject(id) {
      this.id = id;
    }
    $scope.$on("$destroy", function() {

      lastValueRef.off("value", lastValueSubscription);

      networkRef.off("value", networkSubscription);

      console.log("good bye sensors controller");
    });
  }
]);
