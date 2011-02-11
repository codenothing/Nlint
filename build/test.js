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
	options = {
		logfile: root + 'build/out/lint.out',
		verbose: true,
		encodings: [ 'UTF-8-BOM' ],
		jslint: __dirname + '/../tools/custom.jslint.js',
		'default': 'jslint',
		'show-missing': true,
		'show-ignored': true,
		'show-passed': true,
		'show-warnings': true
	};

// Run nodelint and print out response
Nodelint( [ root, root + 'configure' ], options, function( e, results ) {
	// Unknown Error
	if ( e ) {
		sys.error( e.message || e );
		process.exit( 1 );
	}
	// There should be two error from the test dir
	else if ( results.errors.length < 2 ) {
		sys.error( Nodelint.Color.bold.red( "Did not find test error in test/error.js" ) );
		process.exit( 1 );
	}
	// Make sure that there are only two errors
	else if ( results.errors.length === 2 ) {
		Nodelint.leave( 0, results.output );
	}
	// More than two, clean them
	else {
		Nodelint.leave( 1, results.output );
	}
});
