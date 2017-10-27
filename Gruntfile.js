module.exports = function(grunt) {
    grunt.initConfig({
        jshint: {
            files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
        },
        version: {
            defaults: {
                src: ['src/main.js']
            }
        },
        uglify: {
            happyml: {
                options: {
                    beautify: true,
                    mangle: false
                },
                files: {
                    'build/happyml.js': ['src/**/*.js']
                }
            },
            happyml_min: {
                options: {
                    sourceMap: true
                },
                files: {
                    'build/happyml.min.js': ['src/**/*.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-version');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['version', 'jshint', 'uglify']);
};