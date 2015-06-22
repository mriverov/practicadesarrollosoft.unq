module.exports = function(grunt) {

    grunt.initConfig({
        jshint: {
            all: ['Gruntfile.js', 'public/javascript/*.js']
        },

        karma: {
            unit: {
                configFile: 'karma.config.js'
            }
        },

        protractor: {
            options: {
                configFile: 'protractorConf.js',//"node_modules/protractor/example/conf.js", // Default config file
                keepAlive: false, // If false, the grunt process stops when the test fails.
                noColor: false, // If true, protractor will not use colors in its output.
                args: {}
            },
            all: {
                options: {
                    args: {}
                }
            }
        },

        wiredep: {
            task: {
                src: ['views/**/*.ejs']
            },
            options : {
                ignorePath : "../public"
            }
        },

        compile: {
             html: ['jade', 'wiredep'],
             styles: ['concat:styles', 'sass', 'clean:compile'],
             js: ['concat:js']
          }
    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-wiredep');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-protractor-runner');

    grunt.registerTask('default', ['karma', 'jshint'/*, 'protractor'*/]);
    //grunt.registerTask('default', 'jshint');
};