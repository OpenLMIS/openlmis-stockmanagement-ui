module.exports = function(grunt) {
    var configSetup = require('dev-ui/tasks/config.js');
    configSetup(grunt);

    grunt.loadNpmTasks('/dev-ui');
};
