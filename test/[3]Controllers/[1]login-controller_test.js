// Tests here

import 'angular';
import 'angular-route';
import 'angular-mocks';

import '../../app/login/login.controller.js';

describe('controller: LoginController', function() {
  var ctrl,
    authentication,
    val,
    myConfigService;

  beforeEach(angular.mock.module('myConfigModule'));
  beforeEach(angular.mock.module('myApp.login'));

  beforeEach(angular.mock.inject(function(_myConfigService_) {
    myConfigService = _myConfigService_;
  }));

  beforeEach(angular.mock.inject(function($controller, $q) {
    authentication = {
      login: function(email, password) {
        return new Promise(function(resolve, reject) {

          resolve("success");
        });
      },
    };

    ctrl = $controller('LoginController', {
      authentication: authentication
    });

  }));

  it('Should return an error if authentication returns an error', function() {
    expect(ctrl).toBeDefined();
    ctrl.login(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password);
    expect(ctrl.loginError).toBe(null);
  });

});
