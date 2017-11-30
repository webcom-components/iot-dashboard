import 'angular';

var myConfigModule = angular.module('myConfigModule', []);
myConfigModule.service('myConfigService', [function() {
  return {
    // Change these two variables !!!!!!
    datasyncUri: 'https://io.datasync.orange.com/base/space-name',
    WebcomAppName: 'space-name',

    datasyncAdminUri: 'https://io.datasync.orange.com/base/accounts',
    user1Credentials: {
      email: "user1Test@test.com",
      password: "123456",
      wrongEmail: "wTest@test.com",
      wrongPassword: "1234567"
    },
    user2Credentials: {
      email: "user2Test@test.com",
      password: "123456",
      wrongEmail: "wTest@test.com",
      wrongPassword: "1234567"
    },
    user3Credentials: {
      email: "user3Test@test.com",
      password: "123456",
      wrongEmail: "wTest@test.com",
      wrongPassword: "1234567"
    },
    rules: { // Copy the value from Security Rules/Security Rules.json
      "users": {
        "$userId": {
          ".read": "auth != null &&  auth.uid === $userId",
          ".write": "auth != null &&  auth.uid === $userId",
          "name": {
            ".read": true,
            ".validate": "newData.isString() && newData.val().length() <= 30"
          },
          "surname": {
            ".read": true,
            ".validate": "newData.isString() && newData.val().length() <= 30"
          },
          "email": {
            ".validate": "auth.providerUid === newData.val()"
          },
          "prefLang": {
            ".validate": "newData.isString() && newData.val().length() < 5"
          },
          "spaces": {
            "$spaceId": {
              ".write": "root.child('spaces').child($spaceId).child('settings').child('users').child(auth.uid).val().role === 'admin'",
              "name": {
                ".validate": "newData.isString() && newData.val().length() <= 30"
              },
              "description": {
                ".validate": "newData.isString() && newData.val().length() <= 300"
              }
            }
          }
        }
      },
      "spaces": {
        "$spaceId": {
          ".read": "auth != null && (data.child('settings').child('users').hasChild(auth.uid) || newData.child('settings').child('users').hasChild(auth.uid))",
          ".write": "auth != null && (!data.exists() || data.child('settings').child('users').child(auth.uid).val().role === 'admin')",
          "settings": {
            "users": {
              "$userId": {
                ".write": "(auth != null &&  auth.uid === $userId && newData.val() === null) || (!data.exists() && data.child('users').child(auth.uid).val().role === 'admin')",
                "role": {
                  ".write": "auth != null &&  data.child('users').child(auth.uid).val().role === 'admin'"
                }
              }
            }
          },
          "network": {
            "$gtwId": {
              ".read": true,
              ".write": true,
              ".validate": "newData.hasChild('type')",
              "sensors": {
                "$sensorId": {
                  ".validate": "newData.hasChildren(['type', 'name', 'description'])"
                }
              },
              "actuators": {
                "$actuatorId": {
                  ".validate": "newData.hasChildren(['type', 'name', 'description'])"
                }
              }
            }
          },
          "lastValue": {
            "$gtwId": {
              ".read": true,
              ".write": true,
              "$sensorId": {
                ".validate": "newData.hasChild('value')"
              }
            }
          },
          "history": {
            "$gtwId": {
              ".write": true
            }
          },
          "actuators": {
            "$gtwId": {
              ".read": true,
              ".write": true
            }
          }
        }
      },
      "$other": {
        ".read": true,
        ".write": true
      }
    }
  }
}]);
