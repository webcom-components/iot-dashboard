import 'angular';
import 'angular-route';
import 'angular-cookies';
import 'angular-mocks';
import 'webcom/webcom.js';

import tools from '../tools.js';
import '../../app/services/userdata-service.js';
import '../../app/services/auth-service.js';

describe('service: userData', function() {

  const spaceName = "Space name test";
  const spaceDescription = "Description test";

  var webcomAppName, datasyncUri;

  var userData,
    authentication,
    myConfigService;

  var rootRef = undefined,
    usersRef = undefined,
    spacesRef = undefined,
    adminRef = undefined;

  var spaceID = undefined;

  var rule = false;
  var configToken,
    adminToken;

  var user1Id = null,
    user2Id = null,
    user3Id = null;

  // Begin of global beforeEach

  beforeEach(angular.mock.module('myConfigModule'));
  beforeEach(angular.mock.module('userDataModule'));
  beforeEach(angular.mock.module('authenticationModule'));


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

  beforeEach(angular.mock.inject(function(_userData_) {
    userData = _userData_;
  }));

  beforeEach(angular.mock.inject(function(_authentication_) {
    authentication = _authentication_;
  }));

  beforeEach(function() {
    userData.serviceInit();
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


  // End of global beforeEach / afterEach

  describe('should set user data', function() {

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

    beforeEach(function() {
      authentication.ref = rootRef;
      authentication.userIdForTest(user1Id);
      userData.userDataInit();
    });



    afterEach(function() {
      tools.firstTest = 0;
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

    it("should set user data", function(done) {
      userData.setUserData("UserTest", "1", myConfigService.user1Credentials.email, "auto").then(function() {
        done();
      }).catch(function(error) {
        fail("Error : " + error);
      });
    });

  });

  describe("shouldn't set user data", function() {

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

    beforeEach(function() {
      authentication.ref = rootRef;
      var pipouserId = "b5a41d86-xxxx-xxxx-xxxx-d46dd666f189"
      authentication.userIdForTest(pipouserId);
      userData.userDataInit();
    });



    afterEach(function() {
      tools.firstTest = 0;
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

    it("should set user data", function(done) {
      userData.setUserData("UserTest", "1", myConfigService.user1Credentials.email, "auto").then(function() {
        fail("Error : " + error);
      }).catch(function(error) {
        expect(error.code).toBe("permission_denied");
        done();
      });
    });

  });

  describe('should create space', function() {

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

    beforeEach(function() {
      userData.userDataInit();
    });

    beforeEach(function() {
      // To initialize the localStorage used to define the app language
      var languages = ["en", "fr"];

      localStorage.setItem("languages", languages);
    });

    beforeEach(function(done) {
      // To recover user profil data
      function userSubscription(snapshot) {
        userData.userSnapshot = snapshot;
        done();
      }
      userData.userDataRef.on("value", userSubscription);
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

    afterEach(function() {
      userData.userSpaceUnsubscription();
      userData.userDataRef.off("value", userData.userSubscription);
    });

    it("should create space", function(done) {
      userData.createSpace(spaceName).then(function() {
        done();
      }).catch(function(error) {
        fail("Error on <Create space> test", error.code);
      });
    });

  });

  describe('should update space', function() {

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
      tools.createSpace(usersRef, spacesRef, user1Id, spaceName).then(function(selectedSpaceID) {
        spaceID = selectedSpaceID;
        done();
      }).catch(function(error) {
        fail("Error : " + error.code);
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

    it("should update space", function(done) {
      userData.selectedSpaceID = spaceID;
      userData.updateSpace(spaceName + " Updated", spaceDescription).then(function() {
        done();
      }).catch(function(error) {
        fail("Error on <update space> test", error.code);
      });
    });

  });


  describe('should add collaborator', function() {

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
      tools.createSpace(usersRef, spacesRef, user1Id, spaceName).then(function(selectedSpaceID) {
        spaceID = selectedSpaceID;
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
      rootRef.removeUser(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function() {
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

    it("should add collaborator", function(done) {
      userData.selectedSpaceID = spaceID;
      userData.addCollaborator(user2Id, "Member").then(function(success) {
        done();
      }).catch(function(error) {
        fail("Error on <add collaborator> test " + error.code);
      });
    });
  });

  describe("shouldn't add collaborator", function() {

    beforeEach(function(done) {
      tools.createUser(webcomAppName, configToken, myConfigService.user3Credentials.email, myConfigService.user3Credentials.password).then(function(data) {
        done()
      }).catch(function(resp) {
        fail("createUser error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    });

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
      tools.createSpace(usersRef, spacesRef, user1Id, spaceName).then(function(selectedSpaceID) {
        spaceID = selectedSpaceID;
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
        email: myConfigService.user3Credentials.email,
        password: myConfigService.user3Credentials.password
      };
      rootRef.authWithPassword(credentials).then(function(auth) {
        user3Id = auth.uid;
        console.log("authWithPassword success");
        done();
      }).catch(function(error) {
        fail("ERROR authWithPassword " + error.code);
      });
    });

    beforeEach(function(done) {
      tools.setUserData(usersRef, "UserTest", "3", myConfigService.user3Credentials.email, "auto", user3Id).then(function() {
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

    beforeEach(function(done) {
      userData.selectedSpaceID = spaceID;
      userData.addCollaborator(user2Id, "Member").then(function(success) {
        done();
      }).catch(function(error) {
        fail("Error on add collaborator " + error.code);
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

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });


    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user3Credentials.email, myConfigService.user3Credentials.password).then(function() {
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

    it("shouldn't add collaborator", function(done) {
      userData.selectedSpaceID = spaceID;
      userData.addCollaborator(user3Id, "Member").then(function(success) {
        fail("Error on <Can't add collaborator> test ");
      }).catch(function(error) {
        done();
      });
    });
  });


  describe("should change collaborator rule", function() {

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
      tools.createSpace(usersRef, spacesRef, user1Id, spaceName).then(function(selectedSpaceID) {
        spaceID = selectedSpaceID;
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

    beforeEach(function(done) {
      userData.selectedSpaceID = spaceID;
      userData.addCollaborator(user2Id, "Member").then(function(success) {
        done();
      }).catch(function(error) {
        fail("Error on add collaborator " + error.code);
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
      rootRef.removeUser(myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function() {
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

    it("should change collaborator rule", function(done) {
      userData.selectedSpaceID = spaceID;
      userData.changeCollaboratorRule(user2Id, "Administrator").then(function(success) {
        expect(success).toBe(null);
        done();
      }).catch(function(error) {
        fail("Error on <Can change collaborator rule> test ");
      });
    });
  });

  describe("shouldn't change collaborator rule (Last Admin)", function() {

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
      tools.createSpace(usersRef, spacesRef, user1Id, spaceName).then(function(selectedSpaceID) {
        spaceID = selectedSpaceID;
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

    beforeEach(function(done) {
      userData.selectedSpaceID = spaceID;
      userData.addCollaborator(user2Id, "Member").then(function(success) {
        done();
      }).catch(function(error) {
        fail("Error on add collaborator " + error.code);
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

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function() {
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

    it("shouldn't change collaborator rule (Last Admin)", function(done) {
      userData.selectedSpaceID = spaceID;
      userData.changeCollaboratorRule(user1Id, "Member").then(function(success) {
        fail("Error on <Can change collaborator rule> test ");
      }).catch(function(error) {
        expect(error.code).toBe("LAST_ADMIN");
        done();
      });
    });
  });

  describe("shouldn't change collaborator rule (Permission denied)", function() {

    beforeEach(function(done) {
      tools.createUser(webcomAppName, configToken, myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function(data) {
        done()
      }).catch(function(resp) {
        fail("createUser error status :" + resp.responseJSON.status + " error= " + resp.responseJSON.error);
      });
    });

    beforeEach(function(done) {
      tools.createUser(webcomAppName, configToken, myConfigService.user3Credentials.email, myConfigService.user3Credentials.password).then(function(data) {
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
      tools.createSpace(usersRef, spacesRef, user1Id, spaceName).then(function(selectedSpaceID) {
        spaceID = selectedSpaceID;
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
        email: myConfigService.user3Credentials.email,
        password: myConfigService.user3Credentials.password
      };
      rootRef.authWithPassword(credentials).then(function(auth) {
        user3Id = auth.uid;
        console.log("authWithPassword success");
        done();
      }).catch(function(error) {
        fail("ERROR authWithPassword " + error.code);
      });
    });

    beforeEach(function(done) {
      tools.setUserData(usersRef, "UserTest", "3", myConfigService.user3Credentials.email, "auto", user3Id).then(function() {
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

    beforeEach(function(done) {
      userData.selectedSpaceID = spaceID;
      userData.addCollaborator(user2Id, "Member").then(function(success) {
        done();
      }).catch(function(error) {
        fail("Error on add collaborator " + error.code);
      });
    });

    beforeEach(function(done) {
      userData.selectedSpaceID = spaceID;
      userData.addCollaborator(user3Id, "Administrator").then(function(success) {
        done();
      }).catch(function(error) {
        fail("Error on add collaborator " + error.code);
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

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user1Credentials.email, myConfigService.user1Credentials.password).then(function() {
        done();
      }).catch(function() {
        fail();
      });
    });

    afterEach(function(done) {
      rootRef.removeUser(myConfigService.user2Credentials.email, myConfigService.user2Credentials.password).then(function() {
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

    it("shouldn't change collaborator rule (Permission denied)", function(done) {
      userData.selectedSpaceID = spaceID;
      userData.changeCollaboratorRule(user1Id, "Member").then(function(success) {
        fail("Error on <Can change collaborator rule> test ");
      }).catch(function(error) {
        expect(error.code).toBe("permission_denied");
        done();
      });
    });
  });

  describe("Remove definitely the space", function() {

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
      tools.createSpace(usersRef, spacesRef, user1Id, spaceName).then(function(selectedSpaceID) {
        spaceID = selectedSpaceID;
        done();
      }).catch(function(error) {
        fail("Error : " + error.code);
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


    it("should remove space definitely", function(done) {
      userData.selectedSpaceID = spaceID;
      var collaboratorsSpace = [];
      var userId1Object = new tools.createIdObject(user1Id);
      collaboratorsSpace.push(userId1Object);
      rule = true;

      userData.removeSpaceDefinitely(collaboratorsSpace, rule).then(function() {
        done();
      }).catch(function(error) {
        fail("Error on removing space definitely", error.code);
      });
    });

    it("shouldn't remove space definitely", function(done) {
      userData.selectedSpaceID = spaceID;
      var collaboratorsSpace = [myConfigService.user1Credentials, myConfigService.user2Credentials];
      rule = false;
      userData.removeSpaceDefinitely(collaboratorsSpace, rule).then(function(success) {
        fail("Error on removing space definitely");
      }).catch(function(error) {
        expect(error.code).toBe("NOT_ADMIN");
        done();
      });
    });


  });

});
