'use strict';

/** Importation of the dependencies **/
import 'angular-route';
import 'angular-sanitize';
import 'angular-translate';
import 'angular-translate-loader-static-files';
import 'angular-messages';
import 'ng-dialog';

/** Importation of modules **/
import './services/config-service.js'
import './header/header.controller.js';
import './login/login.controller.js';
import './signup/signup.controller.js';
import './aftersignup/afterSignup.controller.js';
import './components/version/version-directive.js';
import './components/version/version.js';
import './components/version/interpolate-filter.js';
import './sensors/sensors.controller.js';
import './user/user.controller.js';
import './spaceedition/spaceEdition.controller.js';
import './popup/popup.controller.js';

/** Declare app level module which depends on other modules, and components **/
var myApp = angular.module('myApp', [

  'ngRoute',
  'ngMessages',
  'ngSanitize',
  'pascalprecht.translate',
  'myApp.header',
  'myApp.login',
  'myApp.signup',
  'myApp.aftersignup',
  'myApp.version',
  'myApp.user',
  'myApp.spaceedition',
  'authenticationModule',
  'myApp.sensors',
  'myApp.popup',

  'userDataModule'

]);

/** Configuration of the app module **/
myApp.config([
  '$locationProvider',
  '$routeProvider',
  '$translateProvider',
  function($locationProvider, $routeProvider, $translateProvider) {


    // The available languages for the website
    var languages = ["en", "fr"];

    localStorage.setItem("languages", languages);

    // Recuperate the language file in : languages (example : /languages/en.json)
    $translateProvider.useStaticFilesLoader({prefix: '/languages/', suffix: '.json'});

    var i = 0;

    for (; i < languages.length; i++) {

      if (window.navigator.language == languages[i]) {

        $translateProvider.use(window.navigator.language);
        break;

      } else {

        $translateProvider.use('en');

      }
    }

    // Use sanitize strategy
    $translateProvider.useSanitizeValueStrategy(null);

    // if we have the correct url we access to the page specified
    $locationProvider.hashPrefix('!');

    // else we are redirected to the login page
    $routeProvider.otherwise({redirectTo: '/login'});
  }
]);

/** Run the application **/
myApp.run([
  '$rootScope',
  'authentication',
  '$location',

  function($rootScope, authentication, $location, $locationProvider) {



    var requestedLocation = "/user";

    // If the application changes route
    $rootScope.$on('$routeChangeStart', function(event, next) {

      var currentLocation = $location.url();
      var user = authentication.getAuth();

      console.log('Route Changed ... ');
      console.log("auth user :", user);
      console.log("currentLocation", currentLocation);
      var selectedSpaceID = localStorage.getItem("selectedSpaceID");

      // If we don't select a space, we should be redirected to user page
      if (currentLocation === '/spaceedition' && selectedSpaceID === null) {
        $location.path('/user');
      }  //FIXME now useless ??? 

      if (currentLocation == '/login' && user != null) {
        $location.path('user' // If not connected and not public access redirection login page
        );
      } else if (!next.publicAccess && user == null) {

        if (currentLocation !== '/login' && currentLocation !== '') {

          requestedLocation = currentLocation;

        }
        console.log("requestedLocation app.js", requestedLocation);
        $location.path('/login');

      }

      localStorage.setItem("requestedLocation", requestedLocation);

    });
  }

]);
