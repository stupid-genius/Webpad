'use strict';

module.exports = function(grunt){
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);

	const config = {
		build: 'build'
	};

	grunt.initConfig({
		config: config,
		browserSync: {
			options: {
				background: true,
				open: false
			},
			dev: {
				options: {
					files: ['app/**/*'],
					port: 9000,
					proxy: 'localhost:3000'
				},
			}
		},
		wiredep: {
			app: {
				ignorePath: '../public/',
				src: ['app/views/bundle.ejs'],
			},
			options: {
				directory: 'app/public/bower_components'
			}
		},
		exec: {
			clean: 'rm -rf <%= config.build %>/',
			hash: {
				cmd: 'git rev-parse --short @',
				sync: true,
				callback: (err, stdout) => {
					config.hash = stdout.trim();
				}
			},
			start: 'npm run nodemon'
		},
		useminPrepare: {
			options: {
				dest: '<%= config.build %>/public'
			},
			html: [
				'app/views/bundle.ejs'
			]
		},
		usemin: {
			css: ['<%= config.build %>/public/styles/{,*/}*.css'],
			html: ['<%= config.build %>/views/{,*/}*.ejs'],
			options: {
				assetsDirs: ['<%= config.build %>/public/images'],
			}
		},
		htmlmin: {
			dist: {
				options: {
					removeCommentsFromCDATA: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					// removeAttributeQuotes: true,
					// removeRedundantAttributes: true,
					// useShortDoctype: true,
					removeEmptyAttributes: true,
					// removeOptionalTags: true
				},
				files: [{
					expand: true,
					cwd: 'app/public',
					src: '*.html',
					dest: '<%= config.build %>/public'
				}]
			}
		},
		imagemin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'app/public/images',
					src: '{,*/}*.{gif,ico,jpeg,jpg,png}',
					dest: '<%= config.build %>/public/images'
				}]
			}
		},
		copy: {
			build:{
				files: [{
					expand: true,
					cwd: 'app',
					dest: '<%= config.build %>/',
					src: [
						'{.*,*}',
						'src/**',
						'views/**'
					]
				/*
				},{
					expand: true,
					cwd: 'app/public/bower_components/tinymce',
					dest: '<%= config.build %>/public/scripts',
					src: [
						'plugins/**',
						'skins/**',
						'themes/**'
					]
				},{
					expand: true,
					cwd: 'app/public/bower_components/ace-builds/src',
					dest: '<%= config.build %>/public/vim',
					src: [
						'keybinding-vim.js',
						'theme-gob.js'
					]
				*/
				},{
					expand: true,
					cwd: 'app/public/bower_components',
					dest: '<%= config.build %>/public/bower_components',
					src: [
						'ace-builds/**',
						'tinymce/**'
					]
				}]
			}
		},
		compress: {
			build: {
				options: {
					archive: function() {
						var packageJSON = grunt.file.readJSON('package.json');
						return `dist/${packageJSON.name}_${packageJSON.version}_${config.hash}.zip`;
					}
				},
				files: [{
					expand: true,
					cwd: '<%= config.build %>',
					src: ['**'],
					dest: ''
				}]
			}
		}
	});

	grunt.registerTask('build', 'create build', [
		'exec:clean',
		'useminPrepare',
		'concat:generated',
		'cssmin:generated',
		'uglify:generated',
		'htmlmin',
		'imagemin',
		'copy',
		'usemin',
		'buildPackageJSON'
	]);
	grunt.registerTask('buildPackageJSON', 'build deployment package.json', function(){
		const packageJSON = grunt.file.readJSON('package.json');
		delete packageJSON.devDependencies;
		delete packageJSON.eslintConfig;
		delete packageJSON.main;
		delete packageJSON.repository;
		delete packageJSON.scripts;
		packageJSON.scripts = {
			'start': 'npx nodemon src/index.js'
		};
		grunt.file.write(`${config.build}/package.json`, JSON.stringify(packageJSON, null, '\t'));
	});
	grunt.registerTask('serve', 'start local server', ['browserSync:dev', 'exec:start']);
	grunt.registerTask('zip', 'build deployment archive', ['exec:hash', 'compress']);
	grunt.registerTask('default', 'serve');
};

