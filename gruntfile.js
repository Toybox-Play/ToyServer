module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            t1: {
                files: [{
                    cwd: 'lib/',
                    src: '**/*.js',
                    dest: 'lib/',
                    expand: true,
                    flatten: false,
                    ext: '.js'
                }]
            }
        }
    })
}