/*jslint node: true */
"use strict";

var $            = require( "gulp-load-plugins" )();
var argv         = require( "yargs" ).argv;
var gulp         = require( "gulp" );
var browserSync  = require( "browser-sync" ).create();
var cleanCSS     = require( "gulp-clean-css" );
var concat       = require( "gulp-concat" );
var merge        = require( "merge-stream" );
var sequence     = require( "run-sequence" );
var del          = require( "del" );
var uglify       = require( "gulp-uglify" );
var pump         = require( "pump" );
var sass         = require( "gulp-sass" );
var sourcemaps   = require( "gulp-sourcemaps" );
var autoprefixer = require( "gulp-autoprefixer" );
var replace      = require( "gulp-string-replace" );
var zip          = require( "gulp-zip" );
var jshint       = require( "gulp-jshint" );
var jscs         = require( "gulp-jscs" );
var scss         = require( "gulp-stylelint" );
var config       = require( "./config.json" );
var phpcs        = require( "gulp-phpcs" );
var stylelintConfig = require( "stylelint-config-wordpress/scss.js" );

gulp.task( "watch", [ 'build-css', 'copy-files', 'combine-javascript' ], function() {
	browserSync.init({
		proxy : config.dev.proxy
	});

	gulp.watch( 'src/**', [ 'copy-files' ] ).on('change', browserSync.reload);

	gulp.watch( config.paths.javascript.frontend, [ 'combine-javascript:frontend' ] ).on('change', browserSync.reload);

	gulp.watch( config.paths.javascript.backend, [ 'combine-javascript:backend' ] ).on('change', browserSync.reload);

	gulp.watch( config.paths.watch.css, [ 'build-css' ] );
});

gulp.task( 'publish', function() {
	sequence( 'publish:css', 'publish:prepare', 'publish:copy', 'publish:make:zip', 'publish:cleanup' );
});

gulp.task( "combine-javascript", function() {
	return sequence( [ 'combine-javascript:frontend', 'combine-javascript:backend'] );
});

gulp.task( "build", [ "clean" ], function(done) {
	sequence( 'copy-files', [ "build-css", "combine-javascript" ], done );
});

gulp.task( 'copy-files', function() {
	sequence( [ 'copy-files:php' ] )
});

gulp.task( "lint", function() {
	return sequence( [ 'lint:javascript:cs', 'lint:javascript', 'lint:scss' ] );
});

gulp.task( "clean", function() {
	return del([
		config.dev.destination + "**"
	], {
		force: true
	});
});

gulp.task( "combine-javascript:frontend", function() {
	return pump([
		gulp.src( config.paths.javascript.frontend )
			.pipe( concat( config.project.slug + '.js' ) ),
		gulp.dest( config.dev.destination + 'assets/js' )
	]);
});

gulp.task( "combine-javascript:backend", function() {
	return pump([
		gulp.src( config.paths.javascript.backend )
			.pipe( concat( 'backend.js' ) ),
		gulp.dest( config.dev.destination + 'assets/js' )
	]);
});

gulp.task( 'publish:css', function() {
	var version_date = new Date();
	var version = version_date.getFullYear() + '.' + ( version_date.getMonth() + 1 ) + '.' + version_date.getDate() + '.' + version_date.getHours() + '.' + version_date.getMinutes();

	return gulp.src( config.paths.css )
		.pipe( sourcemaps.init() )
		.pipe( sass().on( 'error', sass.logError ) )
		.pipe( autoprefixer({
			browsers : [
				'last 2 versions',
				'ie >= 9']
		}) )
		.pipe( concat( 'style.css' ) )
		.pipe( replace( /CSS_VERSION_HEADER/g, version ) )
		.pipe( gulp.dest( config.dev.destination ) )
		.pipe( browserSync.stream() );
});

gulp.task( 'publish:prepare', function() {
	del( [ config.project.zip ] );

	var publish_css = gulp.src( config.dev.destination + 'style.css' )
		.pipe( cleanCSS() )
		.pipe( gulp.dest( config.dev.destination ) );

	var publish_js = pump([
		gulp.src( config.paths.javascript.frontend )
			.pipe( concat( config.project.slug + '.js' ) ),
		uglify(),
		gulp.dest( config.dev.destination + 'assets/js' )
	]);

	var publish_backend_js = pump([
		gulp.src( config.paths.javascript.backend )
			.pipe( concat( 'backend.js' ) ),
		uglify(),
		gulp.dest( config.dev.destination + 'assets/js' )
	]);

	return merge( publish_css, publish_js, publish_backend_js );
});

gulp.task( 'publish:copy', function() {
	return gulp.src( [ config.dev.destination + '**' ] )
		.pipe( gulp.dest( config.project.slug ) );
});

gulp.task( 'publish:make:zip', function() {
	return gulp.src(
		[ config.project.slug + '/**' ],
		{
			base : '.'
		} )
		.pipe( zip( config.project.zip ) )
		.pipe( gulp.dest( '.' ) );
});

gulp.task( 'publish:cleanup', function() {
	return del( [ config.project.slug + '/**' ] );
});

gulp.task( 'copy-files:php', function() {
	return gulp.src( 'src/**' )
		.pipe( gulp.dest( config.dev.destination ) );
});

gulp.task( 'build-css', function() {
	return gulp.src( config.paths.css )
		.pipe( sourcemaps.init() )
		.pipe( sass().on( 'error', sass.logError ) )
		.pipe( sourcemaps.write() )
		.pipe( autoprefixer({
			browsers : [
				'last 2 versions',
				'ie >= 9']
		}) )
		.pipe( concat( 'style.css' ) )
		.pipe( gulp.dest( config.dev.destination ) )
		.pipe( browserSync.stream() );
});

gulp.task( "clean:javascript", function() {
	return del([
		config.dev.destination + "assets/js/"
	]);
});

gulp.task( "clean:css", function() {
	return del([
		config.dev.destination + "assets/css/"
	]);
});

gulp.task( "lint:javascript", function() {
	var frontend = gulp.src( config.paths.javascript.frontend )
		.pipe( jshint() )
		.pipe( jshint.reporter() );

	var backend = gulp.src( config.paths.javascript.backend )
		.pipe( jshint() )
		.pipe( jshint.reporter() );

	return merge( frontend, backend );
});

gulp.task( 'lint:javascript:cs', function() {
	var frontend = gulp.src( config.paths.javascript.frontend )
		.pipe( jscs({
			fix    : false
		}) )
		.pipe( jscs.reporter() );

	var backend = gulp.src( config.paths.javascript.frontend )
		.pipe( jscs({
			fix    : false
		}) )
		.pipe( jscs.reporter() );

	return merge( frontend, backend );
});

gulp.task( 'lint:scss', function() {
	return gulp.src( config.paths.watch.css )
		.pipe( scss({
			failAfterError: true,
			config: stylelintConfig,
			reporters: [
				{
					formatter: 'string',
					console: true
				}
			]
		}));
});

gulp.task( 'phpcs', function() {
	return gulp.src( config.paths.watch.php )
		.pipe( phpcs({
			bin: 'vendor/bin/phpcs.bat',
			standard: 'wpcs-ruleset.xml'
		}))
		.pipe( phpcs.reporter( 'log' ) );
});