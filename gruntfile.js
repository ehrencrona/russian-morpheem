module.exports = function (grunt) {
    grunt.initConfig({
        serve: {
            options: {
                port: 9000
            }
        },
        sass: {
            options: {
                sourceMap: false
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: 'stylesheets',
                        src: ['*.scss'],
                        dest: 'public/stylesheets',
                        ext: '.css'
                    }
                ]
            }
        },
        watch: {
            html: {
                files: ['public/*', 'public/stylesheets/*', 'templates']
            },
            templates: {
                files: ['templates/*'],
                tasks: ['ngtemplates']
            },
            css: {
                files: ['stylesheets/**/*.scss'],
                tasks: ['sass']
            },
            js: {
                files: ['js/**/*.js'],
                tasks: ['browserify']
            }
        },
        filerev: {
            options: {
                algorithm: 'md5',
                length: 8
            },
            dist: {
                src: 'dist/build/app.js'
            },
            // can't use wildcards since it will then re-filerev already existing, old files
            maincss: {
                src: 'dist/stylesheets/main.css'
            }
        },
        useminPrepare: {
            html: {
                options:
                {
                    assetsDirs : [],
                    type:'html'
                },
                files: {src: ['public/*.html']}
            },
            options: {
                dest: 'dist'
            }
        },
        usemin: {
            html: {
                options:
                {
                    assetsDirs : [],
                    type:'html'
                },
                files: {src: ['dist/*.html']}
            },
            options: {
                dest: 'dist'
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            // dist configuration is provided by useminPrepare
            dist: {},
            generated: {}
        },
        cssmin: {
            generated: {}
        },
        copy: {
            options: {
                noProcess: ['**/*.{png,gif,mp3,jpg,ico,psd}'],
                encoding: null,
                process: null,
                punctuation: null,
                separator: null
            },
            release: {
                files: [
                    {
                        expand: true,
                        cwd: 'public',
                        src: [
                            '*.png',
                            'favicon.ico',
                            'img/*.png',
                            'img/*.jpg',
                            'build/app.js',
                            'js/trackjs.js',
                            'build/*.js',
                            'directives/*.html',
                            '*.html'
                        ],
                        dest: 'dist'
                    }
                ]
            }
        },
        uglify: {
            options: {
                sourceMap: true
            }
        },
        ngtemplates:  {
            morpheemJapanese: {
                cwd:      'templates',
                src:      '*.html',
                dest:     'public/build/templates.js'
            }
        },
        browserify: {
	        'public/build/app.js': [
                'js/frontend/**/*.js',
                'js/shared/**/*.js'
            ]
        },
        cdn: {
            options: {
                /** @required - root URL of your CDN (may contains sub-paths as shown below) */
                cdn: '//morfeem.com/',
                /** @optional  - if provided both absolute and relative paths will be converted */
                flatten: false,
                /** @optional  - if provided will be added to the default supporting types */
                supportedTypes: { 'mustache': 'html' }
            },
            dist: {
                /** @required  - gets sources here, may be same as dest  */
                cwd: './dist/',
                /** @required  - puts results here with respect to relative paths  */
                dest: './dist/',
                /** @required  - files to process */
                src: [ 'stylesheets/*.css', 'directives/*.html' ]
            }
        }
    });

    grunt.loadNpmTasks('grunt-serve');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-sass');

    grunt.loadNpmTasks('grunt-usemin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-filerev');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-cdn');

    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-angular-templates');

    grunt.registerTask('default', ['sass', 'browserify', 'ngtemplates' ]);

    grunt.registerTask('build', [
        'sass',
        'browserify',
        'copy',
        'ngtemplates',
        'useminPrepare',
        'concat:generated',
        'cssmin:generated',
        'uglify:generated',
        'filerev',
        'usemin',
        'cdn'
    ]);

    grunt.registerTask('cordova', [
        'sass',
        'browserify',
        'copy',
        'ngtemplates',
        'useminPrepare:app',
        'concat:generated',
        'cssmin:generated',
        /* usemin doesn't work unless uglify is run because it generates the concatenated app.js in
            a temp directory that uglify then moves back. so when we are not using uglify (because it's slow)
            we need this step.
         */
        'usemin'
    ]);
};
