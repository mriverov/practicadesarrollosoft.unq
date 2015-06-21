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

    grunt.registerTask('default', ['karma', 'jshint']);
    //grunt.registerTask('default', 'jshint');
};