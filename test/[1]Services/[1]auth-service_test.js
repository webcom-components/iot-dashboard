import 'angular';
import 'angular-route';
import 'angular-cookies';
import 'angular-mocks';
import 'webcom/webcom.js';

import tools from '../tools.js';
import '../../app/services/auth-service.js';

describe('service: authentication', function() {

  const spaceName = "Space name test";
  const spaceDescription = "Description test";

  var webcomAppName, datasyncUri;

  var authentication,
    myConfigService;

  var rootRef = undefined,
    adminRef = undefined;

  var configToken,
    adminToken;

  var user1Id = null,
    user2Id = null,
    user3Id = null;

  // Begin of global beforeEach

  beforeEach(angular.mock.module('myConfigModule'));
  beforeEach(angular.mock.module('authenticationModule'));

  beforeEach(angular.mock.inject(function(_myConfigService_) {
    myConfigService = _myConfigService_;
  }));

  beforeEach(function(done) {
    tools.initBrowser(myConfigService).then(function(browserData) {
      console.log(browserData.webcomAppName + " " + browserData.datasyncUri);
      adminRef = browserData.adminRef;
      webcomAppName = browserData.webcomAppName;
      datasyncUri = browserData.datasyncUri;
      done();
    });
  });

  beforeEach(function(done) {
    tools.adminLogin(adminRef).then(function(token) {
      adminToken = token;
      done();
    }).catch(function(error) {
      fail(error.code);
    });
  });

  beforeEach(function(done) {
    if (tools.firstTest == 1) {
      tools.deleteWebcomApplication(webcomAppName, adminToken).then(function() {
        done();
      }).catch(function(resp) {
        done();
      });
    } else {
      done();
    }
  });

  beforeEach(function(done) {
    if (tools.firstTest == 1) {
      tools.createWebcomApplication(webcomAppName, adminToken).then(function() {
        done();
      }).catch(function(resp) {
        fail("create Webcom Application error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    } else {
      done();
    }
  });

  beforeEach(function(done) {
    tools.getAdminToken(webcomAppName, adminToken).then(function(token) {
      configToken = token;
      done();
    }).catch(function(resp) {
      fail("get Admin Token error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
    });
  });

  beforeEach(function(done) {
    if (tools.firstTest == 1) {
      tools.setWebcomApplicationRulesConfig(webcomAppName, configToken, myConfigService.rules).then(function() {
        done();
      }).catch(function(resp) {
        fail("set webcom application rules config error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    } else {
      done();
    }
  });

  beforeEach(function(done) {
    if (tools.firstTest == 1) {
      tools.setWebcomApplicationConfig(webcomAppName, configToken).then(function() {
        done();
      }).catch(function(resp) {
        fail("set webcom application config error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    } else {
      done();
    }
  });

  beforeEach(function(done) {
    tools.logout(adminRef).then(function() {
      done();
    }).catch(function() {
      fail();
    });
  });

  beforeEach(angular.mock.inject(function(_authentication_) {
    authentication = _authentication_;
  }));

  beforeEach(function() {
    authentication.serviceInit();
    rootRef = new Webcom(datasyncUri);
  });

  beforeEach(function(done) {
    tools.adminLogin(adminRef).then(function(token) {
      adminToken = token;
      done();
    }).catch(function(error) {
      fail(error.code);
    });
  });

  beforeEach(function(done) {
    tools.getAdminToken(webcomAppName, adminToken).then(function(token) {
      configToken = token;
      done();
    }).catch(function(resp) {
      fail("get Admin Token error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
    });
  });

  beforeEach(function(done) {
    tools.createUser(webcomAppName, configToken, myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function(data) {
      done()
    }).catch(function(resp) {
      fail("createUser error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
    });
  });



  afterEach(function(done) {
    tools.logout(adminRef).then(function() {
      done();
    }).catch(function() {
      fail();
    });
  });

  afterEach(function(done) {
    if (tools.lastTest == 0) {
      tools.resetNameSpace(webcomAppName, configToken).then(function() {
        console.log("loool");
        done();
      }).catch(function(resp) {
        fail("Reset Name Space Error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    } else {
      tools.deleteWebcomApplication(webcomAppName, adminToken).then(function() {
        done();
      }).catch(function(resp) {
        fail("Delete Name Space Error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    }
  });

  afterEach(function(done) {
    tools.getAdminToken(webcomAppName, adminToken).then(function(token) {
      configToken = token;
      done();
    }).catch(function(resp) {
      fail("set webcom application config error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
    });
  });

  afterEach(function(done) {
    tools.adminLogin(adminRef).then(function(token) {
      adminToken = token;
      done();
    }).catch(function(error) {
      fail(error.code);
    });
  });


  // End of global beforeEach / afterEach

  describe('login', function() {

    beforeEach(function(done) {
      tools.logout(adminRef).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    afterEach(function(done) {
      tools.logout(rootRef).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    it("should login", function(done) {
      tools.firstTest = 0;
      authentication.login(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function(success) {
        done();
      }).catch(function(errorCode) {
        fail("Login error", errorCode);
      });
    });

    it("shouldn't login (Wrong password)", function(done) {
      authentication.login(myConfigService.user1Credentials.email, myConfigService.user1Credentials.wrongPassword).then(function(success) {
        fail("Login error");
      }).catch(function(errorCode) {
        expect(errorCode).toBe("INVALID_PASSWORD");
        done();
      });
    });

    it("shouldn't login (Wrong email)", function(done) {
      authentication.login(myConfigService.user1Credentials.wrongEmail, myConfigService.user1Credentials.wrongPassword).then(function(success) {
        fail("Login error");
      }).catch(function(errorCode) {
        expect(errorCode).toBe("INVALID_PASSWORD");
        done();
      });
    });

  });

  describe('logout', function() {

    beforeEach(function(done) {
      tools.logout(adminRef).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    beforeEach(function(done) {
      var credentials = {
        email: myConfigService.user1Credentials.email,
        password: myConfigService.user1Credentials.password
      };
      rootRef.authWithPassword(credentials).then(function(auth) {
        user1Id = auth.uid;
        console.log("authWithPassword success");
        done();
      }).catch(function(error) {
        fail("ERROR authWithPassword " + error.code);
      });
    });

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });


    it("should logout", function(done) {
      authentication.disconnect().then(function(success) {
        expect(success).toBe(null);
        done();
      }).catch(function(error) {
        fail('disconnection failed')
      });
    });

  });


});
