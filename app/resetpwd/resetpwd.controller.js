'use strict';

/** Import the signup module from the file **/
import myResetPwd from './resetpwd.module.js';

/** The controller of signup page **/
myResetPwd.controller('ResetPwdController', ['$location', '$rootScope', 'authentication', function($location, $rootScope, authentication) {

    var self = this;

    self.resetPwdError = null;

    /** Sign up function **/
    self.reset = function(email) {

        console.log("reset clicked, email=",email);
        

            authentication.ref.sendPasswordResetEmail(email, function(error) {

                if (error) {

                    self.resetPwdError = error.code;
                    
                    if (!$rootScope.$$phase)
                        $rootScope.$apply();

                    console.log("Reset password error:", error.code);

                } else {

                    //$location.path('/aftersignup');
                    $location.path('/login');
                    if (!$rootScope.$$phase)
                        $rootScope.$apply();
                    console.log("Reset password ok", email);

                }
            })
        

        console.log("reset clicked");
    }
}]);
