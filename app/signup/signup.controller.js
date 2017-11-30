'use strict';

/** Import the signup module from the file **/
import mySignup from './signup.module.js';

/** The controller of signup page **/
mySignup.controller('SignupController', ['$location', '$rootScope', 'authentication', function($location, $rootScope, authentication) {

    var self = this;

    self.signupError = null;
    self.alertpassword = false;

    /** Sign up function **/
    self.signup = function(email, password) {

        if (!self.alertpassword) {

            authentication.ref.createUser(email, password, function(error, identity) {

                if (error) {

                    self.signupError = error.code;
                    self.password = "";
                    self.repeatPassword = "";
                    if (!$rootScope.$$phase)
                        $rootScope.$apply();

                    console.log("User identity not created:", error.code);

                } else {

                    $location.path('/aftersignup');
                    if (!$rootScope.$$phase)
                        $rootScope.$apply();
                    console.log("User identity created and bound to the new account uid:", identity.uid);

                }
            })
        }

        console.log("signup clicked");
    }
}]);
