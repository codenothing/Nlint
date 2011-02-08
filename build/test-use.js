/*
 * Nodelint [VERSION]
 * [DATE]
 * A fork of tav's nodelint (http://github.com/tav/nodelint)
 * Corey Hart @ http://www.codenothing.com
 */
var Nodelint = require('../src/Nodelint'),
	Color = Nodelint.Color,
	sys = require('sys'),
	root = __dirname.replace( /build\/?/, '' ),
	use = process.argv[ 2 ];

// Configure test case
Nodelint.extend( Nodelint.Options, {
	logfile: root + 'build/out/lint-' + use + '.out',
	verbose: true,
	encodings: [ 'UTF-8-BOM' ],
	use: [ use ],
	jslint: __dirname + '/../tools/custom.jslint.js',
	'show-missing': true,
	'show-ignored': true,
	'show-passed': true,
	'show-warnings': true
});

// Run nodelint and print out response
Nodelint( root, function( e, results ) {
	// Unknown Error
	if ( e ) {
		sys.error( e.message || e );
		process.exit( 1 );
	}
	// There should be two error from the test dir
	else if ( ! results.errors.length ) {
		sys.error( Nodelint.Color.bold.red( "Did not find test error for " + use ) );
		process.exit( 1 );
	}
	// Make sure that there are only two errors
	else if ( results.errors.length === 1 ) {
		Nodelint.leave( 0, results.output );
	}
	// More than two, clean them
	else {
		Nodelint.leave( 1, results.output );
	}
});
