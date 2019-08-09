module.exports = function(grunt) {
    var configSetup = require('dev-ui/tasks/config.js');
    configSetup(grunt);
    grunt.config.set('forceStatus', true);
    grunt.option( 'force', true );
    grunt.loadNpmTasks('/dev-ui');
};
