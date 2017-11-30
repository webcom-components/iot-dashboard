

var myConfigModule = angular.module('myConfigModule', []);
myConfigModule.service('myConfigService', [function() {
    return {
        // Change this variable !!!!!!
      datasyncUri : 'https://io.datasync.orange.com/base/name-space'
    };
}]);
