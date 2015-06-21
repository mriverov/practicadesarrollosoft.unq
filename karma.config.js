/**
 * Created by erica on 21/06/15.
 */

// Karma configuration
// Generated on Sat Apr 11 2015 19:38:38 GMT-0300 (ART)

module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['jasmine'],


        // list of files / patterns to load in the browser
        files: [
            'public/javascripts/lib/angular/angular.js',
            'public/javascripts/lib/angular-ui-router/**/angular-ui-router.js',
            'public/javascripts/lib/angular-mocks/angular-mocks.js',
            'public/javascripts/lib/angular-moment/angular-moment.js',
            'public/javascripts/lib/angular-google-maps/**/angular-google-maps.js',
            'public/javascripts/lib/angular-google-places-autocomplete/**/autocomplete.js',

            'public/javascripts/*.js',
            'spec/*Spec.js'
        ],


        // list of files to exclude
        exclude: [
        ],


        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: true
    });
};