//jshint strict: false
module.exports = function(config) {
  config.set({

    basePath: '',

    files: [
      'test/test_index.js'
    ],
    preprocessors: {
      // add webpack as preprocessor
      'test/test_index.js': ['webpack', 'sourcemap']
    },
    webpack: {
      // karma watches the test entry points
      // (you don't need to specify the entry option)
      // webpack watches dependencies

      // webpack configuration
      devtool: 'inline-source-map'
    },
    webpackMiddleware: {
      // webpack-dev-middleware configuration
      stats: 'errors-only'
    },
    //autoWatch: true,
    singleRun: false,

    frameworks: ['jasmine'],

    browsers: ['Chrome',
      'Firefox'
    ],

    plugins: [
      'karma-jasmine',
      'karma-sourcemap-loader',
      'karma-webpack',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      // 'karma-edge-launcher',
      // 'karma-ie-launcher',
      // 'karma-safari-launcher',
      // 'karma-safaritechpreview-launcher',
      // 'karma-opera-launcher',
      // 'karma-phantomjs-launcher',
      'karma-junit-reporter'
    ],

    junitReporter: {
      outputFile: 'test_out/unit.xml',
      suite: 'unit'
    }

  });
};
