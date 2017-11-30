import 'angular';
import 'angular-route';
import 'angular-cookies';
import 'angular-mocks';
import 'webcom/webcom.js';

import tools from '../tools.js';

describe('Profil information : Security rules', function() {

  var myConfigService, userData;
  var webcomAppName, datasyncUri;
  var rootRef = undefined,
    usersRef = undefined,
    spacesRef = undefined;
  var adminRef = undefined;
  var configToken, adminToken;
  var user1Id = null,
    user2Id = null,
    user3Id = null;

  beforeEach(angular.mock.module('myConfigModule'));

  beforeEach(angular.mock.inject(function(_myConfigService_) {
    myConfigService = _myConfigService_;
  }));

  beforeEach(function(done) {
    tools.initBrowser(myConfigService).then(function(browserData) {
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

  beforeEach(function() {
    rootRef = new Webcom(datasyncUri);
    usersRef = rootRef.child("users");
    spacesRef = rootRef.child("spaces");
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

  afterEach(function(done) {
    rootRef.removeUser(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function() {
      done();
    }).catch(function(error) {
      fail(error);
    });
  });

  afterEach(function(done) {
    tools.logout(rootRef).then(function() {
      done();
    }).catch(function(error) {
      fail("logout error : ", error);
    });
  });

  describe('Write test', function() {

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

    it("should write", function(done) {
      tools.firstTest = 0;
      tools.setUserData(usersRef, "UserTest", "1", myConfigService.user1Credentials.email, "auto", user1Id).then(function() {
        done();
      }).catch(function(error) {
        fail("Error : " + error.code);
      });
    });

    it("shouldn't write", function(done) {
      var pipoUserId = "ef12cd45-d22b-4c6a-894b-6847a95fe1c8";
      tools.setUserData(usersRef, "UserTest", "1", myConfigService.user1Credentials.email, "auto", pipoUserId).then(function() {
        fail("Error ");
      }).catch(function(error) {
        expect(error.code).toBe("permission_denied");
        done();
      });
    });

  });

  describe('Read test', function() {


    beforeEach(function(done) {
      tools.createUser(webcomAppName, configToken, myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function(data) {
        done()
      }).catch(function(resp) {
        fail("createUser error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    });

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

    beforeEach(function(done) {
      tools.setUserData(usersRef, "UserTest", "1", myConfigService.user1Credentials.email, "auto", user1Id).then(function() {
        done();
      }).catch(function(error) {
        fail("Error : " + error.code);
      });
    });

    beforeEach(function(done) {
      tools.logout(rootRef).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    beforeEach(function(done) {
      var credentials = {
        email: myConfigService.user2Credentials.email,
        password: myConfigService.user2Credentials.password
      };
      rootRef.authWithPassword(credentials).then(function(auth) {
        user2Id = auth.uid;
        console.log("authWithPassword success");
        done();
      }).catch(function(error) {
        fail("ERROR authWithPassword " + error.code);
      });
    });

    beforeEach(function(done) {
      tools.setUserData(usersRef, "UserTest", "2", myConfigService.user2Credentials.email, "auto", user2Id).then(function() {
        done();
      }).catch(function(error) {
        fail("Error : " + error.code);
      });
    });

    beforeEach(function(done) {
      tools.logout(rootRef).then(function() {
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
      rootRef.removeUser(myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function() {
        done();
      }).catch(function(error) {
        fail(error);
      });
    });

    it("should read", function(done) {
      tools.readUserData(usersRef, user1Id).then(function() {
        done();
      }).catch(function(error) {
        fail("Error : " + error);
      });
    });

    it("shouldn't read", function(done) {
      tools.readUserData(usersRef, user2Id).then(function() {
        fail("Error ");
      }).catch(function(error) {
        expect(error.code).toBe("PERMISSION_DENIED");
        done();
      });
    });

  });

});
