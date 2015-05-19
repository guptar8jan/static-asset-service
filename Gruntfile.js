'use strict';

var path = require('path');

var dependencies = {
  firebird : [
    'jquery-bv@1.11.1',
    'backbone-bv@1.0.0',
    'lodash-bv@1.2.0'
  ],
  curations : [
    'jquery-bv@1.11.1',
    'underscore@1.5.2'
  ],
  spotlights : [
    'backbone-bv@1.2.0',
    'lodash@2.4.1'
  ]
};

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg : grunt.file.readJSON('package.json'),
    webpack : {
      test : {
        entry : './test/integration/main.js',
        output : {
          path : './test/scratch/',
          filename : 'main.js'
        }
      }
    },

    copy : {
      test : {
        files : [
          {
            expand : true,
            cwd : 'test/integration/',
            src : 'index.html',
            dest : 'test/scratch/'
          },
          {
            expand : true,
            cwd : 'node_modules',
            src : 'mocha/mocha.*',
            dest : 'test/scratch/'
          },
          {
            expand : true,
            cwd : 'node_modules',
            src : 'chai/chai.js',
            dest : 'test/scratch/'
          }
        ]
      }
    },

    clean : {
      dist : [
        'dist'
      ],
      test : ['test/scratch']
    },

    eslint : {
      target : [
        'lib/**/*.js',
        'sdk/**/*.js',
        'test/**/*.js',
        '!test/scratch/**/*',
        '!test/fixtures/assets/**/*'
      ]
    },

    generate : {
      dist : {
        src : path.resolve(__dirname, 'assets'),
        dest : path.resolve(__dirname, 'dist'),
        deps : dependencies,
        namespace : 'BV'
      },
      test : {
        src : path.resolve(__dirname, 'test/fixtures/assets'),
        dest : path.resolve(__dirname, 'test/scratch/assets'),
        deps : {
          app : [
            'asset-with-dependency@1.0.0',
            'asset-without-dependency@1.0.0'
          ]
        },
        namespace : 'TEST'
      }
    },

    connect : {
      serve : {
        options : {
          port : 9999,
          base : 'test/scratch',
          open : 'http://localhost:9999/index.html',
          livereload : true
        }
      },
      test : {
        options : {
          port : 9999,
          base : 'test/scratch'
        }
      }
    },

    watch : {
      test : {
        files : [
          'lib/**/*.js',
          'assets/**/*.js',
          'sdk/**/*.js',
          'test/**/*'
        ],
        tasks : ['webpack:test'],
        options : {
          livereload : true
        }
      }
    },

    // PhantomJS tests of SDK
    mocha : {
      all : {
        options : {
          urls : [
            'http://localhost:9999/index.html'
          ]
        }
      }
    },

    // Server-side tests of generator
    mochaTest : {
      test : {
        src : ['test/unit/**/*.js']
      }
    }
  });

  grunt.registerMultiTask('generate', function () {
    var generate = require('./generator');
    var done = this.async();

    generate({
      dependencies : this.data.deps,
      sourceDir : this.data.src,
      targetDir : this.data.dest,
      namespace : this.data.namespace
    }).then(function () {
      done();
    }, function (err) {
      grunt.log.error(err);
      done(false);
    });
  });

  grunt.registerTask('dist', [
    'clean:dist',
    'generate:dist'
  ]);

  grunt.registerTask('serve', [
    'webpack:test',
    'generate:test',
    'copy:test',
    'connect:serve',
    'watch:test'
  ]);

  grunt.registerTask('test', [
    'eslint',
    'webpack:test',
    'generate:test',
    'copy:test',
    'connect:test',
    'mocha',
    'mochaTest'
  ]);

  grunt.registerTask('pre-push', [
    'test'
  ]);
};