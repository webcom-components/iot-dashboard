

var myConfigModule = angular.module('myConfigModule', []);
myConfigModule.service('myConfigService', [function() {
    return {
        //You may have to change "iot-dashboard" with your namespace
      datasyncUri : 'https://io.datasync.orange.com/base/iot-dashboard'
    };
}]);
